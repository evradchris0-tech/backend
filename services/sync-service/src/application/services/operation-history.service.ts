import { Injectable, Logger, Optional, OnModuleDestroy } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import * as crypto from 'crypto';
import { PostgresHistoryService } from './postgres-history.service';

export interface OperationLog {
    id: string;
    eventId: string;
    eventType: string;
    operationType: 'CREATED' | 'UPDATED' | 'DELETED' | 'SYNCED' | 'FAILED' | 'RETRIED';
    sourceService: string;
    targetServices: string[];
    entityType: string;
    entityId: string;
    status: 'SUCCESS' | 'FAILED' | 'PENDING';
    duration: number;
    errorMessage?: string;
    retryCount: number;
    timestamp: Date;
    userId?: string;
    metadata?: Record<string, any>;
}

export interface HistoryFilter {
    eventType?: string;
    operationType?: string;
    status?: 'SUCCESS' | 'FAILED' | 'PENDING';
    startDate?: Date;
    endDate?: Date;
    entityId?: string;
    sourceService?: string;
    targetService?: string;
    limit?: number;
    offset?: number;
}

export interface HistoryResponse {
    data: OperationLog[];
    total: number;
    hasMore: boolean;
    limit: number;
    offset: number;
}

export interface HistoryStats {
    totalOperations: number;
    successCount: number;
    failureCount: number;
    pendingCount: number;
    averageDuration: number;
    operationsByType: Record<string, number>;
    operationsByStatus: Record<string, number>;
    failureRate: number;
    lastOperationAt: Date | null;
    uptime: string;
}

@Injectable()
export class OperationHistoryService implements OnModuleDestroy {
    private readonly logger = new Logger(OperationHistoryService.name);

    private readonly HISTORY_PREFIX = 'sync:operation:';
    private readonly HISTORY_INDEX = 'sync:history:index';
    private readonly STATS_KEY = 'sync:history:stats';
    private readonly REDIS_MAX_SIZE = 1000;
    private readonly REDIS_TTL = 7 * 24 * 60 * 60;

    private readonly postgresEnabled: boolean;
    private readonly batchSize: number;
    private readonly flushIntervalMs: number;

    private operationBuffer: OperationLog[] = [];
    private flushTimer: NodeJS.Timeout | null = null;
    private isShuttingDown = false;

    constructor(
        @InjectRedis() private readonly redis: Redis,
        @Optional() private readonly postgresHistory?: PostgresHistoryService,
    ) {
        this.postgresEnabled = process.env.POSTGRES_HISTORY_ENABLED === 'true' && !!this.postgresHistory;
        this.batchSize = parseInt(process.env.HISTORY_BATCH_SIZE || '50', 10);
        this.flushIntervalMs = parseInt(process.env.HISTORY_FLUSH_INTERVAL || '30000', 10);

        this.startFlushTimer();

        this.logger.log(
            `OperationHistoryService initialized. PostgreSQL: ${this.postgresEnabled ? 'ENABLED' : 'DISABLED'}, ` +
            `BatchSize: ${this.batchSize}, FlushInterval: ${this.flushIntervalMs}ms`
        );
    }

    /**
     * Lifecycle hook : Nettoyage propre a la destruction du module
     */
    async onModuleDestroy(): Promise<void> {
        this.logger.log('Shutting down OperationHistoryService...');
        this.isShuttingDown = true;

        // Arreter le timer de flush
        this.stopFlushTimer();

        // Flush final du buffer avant arret
        if (this.operationBuffer.length > 0) {
            this.logger.log(`Flushing ${this.operationBuffer.length} pending operations before shutdown...`);
            try {
                await this.flushOperationBuffer();
                this.logger.log('Final flush completed successfully');
            } catch (error) {
                this.logger.error(`Final flush failed: ${error.message}`, error.stack);
            }
        }

        this.logger.log('OperationHistoryService shutdown complete');
    }

    /**
     * Demarrer le timer de flush periodique
     */
    private startFlushTimer(): void {
        if (this.flushTimer) {
            return;
        }

        this.flushTimer = setInterval(async () => {
            if (!this.isShuttingDown) {
                await this.flushOperationBuffer();
            }
        }, this.flushIntervalMs);

        // Empecher le timer de bloquer l'arret de Node.js
        this.flushTimer.unref();

        this.logger.debug(`Flush timer started with interval ${this.flushIntervalMs}ms`);
    }

    /**
     * Arreter le timer de flush
     */
    private stopFlushTimer(): void {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
            this.flushTimer = null;
            this.logger.debug('Flush timer stopped');
        }
    }

    /**
     * Enregistrer une operation
     */
    async logOperation(log: Omit<OperationLog, 'id'>): Promise<OperationLog> {
        if (this.isShuttingDown) {
            this.logger.warn('Service is shutting down, operation may not be persisted');
        }

        const id = this.generateId();
        const operationLog: OperationLog = {
            ...log,
            id,
            timestamp: log.timestamp || new Date(),
        };

        try {
            // Ecriture Redis immediate
            await this.writeToRedis(operationLog);

            // Buffer pour PostgreSQL
            if (this.postgresEnabled && this.postgresHistory) {
                this.operationBuffer.push(operationLog);

                if (this.operationBuffer.length >= this.batchSize) {
                    // Flush asynchrone sans bloquer
                    this.flushOperationBuffer().catch((err) =>
                        this.logger.error(`Async flush failed: ${err.message}`)
                    );
                }
            }

            // Mise a jour des stats
            await this.updateStats(operationLog);

            this.logger.debug(`Operation logged: ${operationLog.eventType} - ${id}`);

            return operationLog;
        } catch (error) {
            this.logger.error(`Failed to log operation: ${error.message}`, error.stack);
            return operationLog;
        }
    }

    /**
     * Ecriture Redis
     */
    private async writeToRedis(operationLog: OperationLog): Promise<void> {
        const key = `${this.HISTORY_PREFIX}${operationLog.id}`;

        await this.redis.setex(
            key,
            this.REDIS_TTL,
            JSON.stringify(operationLog),
        );

        await this.redis.zadd(
            this.HISTORY_INDEX,
            operationLog.timestamp.getTime(),
            operationLog.id,
        );

        // Limiter la taille du cache
        await this.trimRedisCache();
    }

    /**
     * Limiter la taille du cache Redis
     */
    private async trimRedisCache(): Promise<void> {
        const indexSize = await this.redis.zcard(this.HISTORY_INDEX);

        if (indexSize > this.REDIS_MAX_SIZE) {
            const toRemove = indexSize - this.REDIS_MAX_SIZE;
            const oldIds = await this.redis.zpopmin(this.HISTORY_INDEX, toRemove);

            for (let i = 0; i < oldIds.length; i += 2) {
                await this.redis.del(`${this.HISTORY_PREFIX}${oldIds[i]}`);
            }
        }
    }

    /**
     * Flush le buffer PostgreSQL
     */
    private async flushOperationBuffer(): Promise<void> {
        if (!this.postgresEnabled || !this.postgresHistory || this.operationBuffer.length === 0) {
            return;
        }

        const toFlush = [...this.operationBuffer];
        this.operationBuffer = [];

        try {
            await this.postgresHistory.persistOperations(toFlush);
            this.logger.debug(`Flushed ${toFlush.length} operations to PostgreSQL`);
        } catch (error) {
            this.logger.error(`Failed to flush buffer: ${error.message}`, error.stack);
            
            // Re-ajouter au buffer en cas d'erreur (sauf si shutdown)
            if (!this.isShuttingDown) {
                this.operationBuffer = [...toFlush, ...this.operationBuffer];
                this.logger.warn(`Re-queued ${toFlush.length} operations after flush failure`);
            }
        }
    }

    /**
     * Recuperer l'historique
     */
    async getHistory(filters: HistoryFilter = {}): Promise<HistoryResponse> {
        const limit = Math.min(filters.limit || 50, 500);
        const offset = filters.offset || 0;

        try {
            const redisCount = await this.redis.zcard(this.HISTORY_INDEX);

            if (redisCount > 0) {
                return this.getHistoryFromRedis(filters, limit, offset);
            } else if (this.postgresEnabled && this.postgresHistory) {
                this.logger.debug('Redis cache miss, falling back to PostgreSQL');
                return this.postgresHistory.getHistory(filters);
            }

            return {
                data: [],
                total: 0,
                hasMore: false,
                limit,
                offset,
            };
        } catch (error) {
            this.logger.error(`Failed to get history: ${error.message}`, error.stack);
            return {
                data: [],
                total: 0,
                hasMore: false,
                limit,
                offset,
            };
        }
    }

    /**
     * Recuperer depuis Redis
     */
    private async getHistoryFromRedis(
        filters: HistoryFilter,
        limit: number,
        offset: number,
    ): Promise<HistoryResponse> {
        const allIds = await this.redis.zrevrange(this.HISTORY_INDEX, 0, -1);

        let operations: OperationLog[] = [];
        for (const id of allIds) {
            const key = `${this.HISTORY_PREFIX}${id}`;
            const data = await this.redis.get(key);
            if (data) {
                operations.push(JSON.parse(data) as OperationLog);
            }
        }

        operations = this.applyFilters(operations, filters);

        const total = operations.length;
        const paginatedOps = operations.slice(offset, offset + limit);
        const hasMore = offset + limit < total;

        return {
            data: paginatedOps,
            total,
            hasMore,
            limit,
            offset,
        };
    }

    /**
     * Historique d'une entite
     */
    async getEntityHistory(entityId: string, limit: number = 100): Promise<OperationLog[]> {
        try {
            const allIds = await this.redis.zrevrange(this.HISTORY_INDEX, 0, -1);

            const operations: OperationLog[] = [];
            for (const id of allIds) {
                const key = `${this.HISTORY_PREFIX}${id}`;
                const data = await this.redis.get(key);
                if (data) {
                    const op = JSON.parse(data) as OperationLog;
                    if (op.entityId === entityId) {
                        operations.push(op);
                        if (operations.length >= limit) break;
                    }
                }
            }

            if (operations.length < limit && this.postgresEnabled && this.postgresHistory) {
                return this.postgresHistory.getEntityHistory(entityId, limit);
            }

            return operations.slice(0, limit);
        } catch (error) {
            this.logger.error(`Failed to get entity history: ${error.message}`, error.stack);
            return [];
        }
    }

    /**
     * Historique d'un evenement
     */
    async getEventHistory(eventId: string): Promise<OperationLog[]> {
        try {
            const allIds = await this.redis.zrevrange(this.HISTORY_INDEX, 0, -1);

            const operations: OperationLog[] = [];
            for (const id of allIds) {
                const key = `${this.HISTORY_PREFIX}${id}`;
                const data = await this.redis.get(key);
                if (data) {
                    const op = JSON.parse(data) as OperationLog;
                    if (op.eventId === eventId) {
                        operations.push(op);
                    }
                }
            }

            if (operations.length === 0 && this.postgresEnabled && this.postgresHistory) {
                return this.postgresHistory.getEventHistory(eventId);
            }

            return operations;
        } catch (error) {
            this.logger.error(`Failed to get event history: ${error.message}`, error.stack);
            return [];
        }
    }

    /**
     * Statistiques globales
     */
    async getStats(): Promise<HistoryStats> {
        try {
            const statsJson = await this.redis.get(this.STATS_KEY);
            if (statsJson) {
                return JSON.parse(statsJson) as HistoryStats;
            }

            if (this.postgresEnabled && this.postgresHistory) {
                const pgStats = await this.postgresHistory.getStats();
                await this.redis.setex(this.STATS_KEY, 300, JSON.stringify(pgStats));
                return pgStats;
            }

            return this.initializeStats();
        } catch (error) {
            this.logger.error(`Failed to get stats: ${error.message}`, error.stack);
            return this.initializeStats();
        }
    }

    /**
     * Statistiques par service
     */
    async getStatsByService(service: string): Promise<Omit<HistoryStats, 'uptime'>> {
        try {
            const operations = await this.getHistory({
                sourceService: service,
                limit: 10000,
            });

            const stats = this.calculateStats(operations.data);

            const cacheKey = `sync:stats:service:${service}`;
            await this.redis.setex(cacheKey, 300, JSON.stringify(stats));

            return stats;
        } catch (error) {
            this.logger.error(`Failed to get stats by service: ${error.message}`, error.stack);
            return this.createEmptyStats();
        }
    }

    /**
     * Statistiques par type
     */
    async getStatsByType(eventType: string): Promise<Omit<HistoryStats, 'uptime'>> {
        try {
            const operations = await this.getHistory({
                eventType,
                limit: 10000,
            });

            const stats = this.calculateStats(operations.data);

            const cacheKey = `sync:stats:type:${eventType}`;
            await this.redis.setex(cacheKey, 300, JSON.stringify(stats));

            return stats;
        } catch (error) {
            this.logger.error(`Failed to get stats by type: ${error.message}`, error.stack);
            return this.createEmptyStats();
        }
    }

    /**
     * Export CSV
     */
    async exportToCSV(filters?: HistoryFilter): Promise<string> {
        const history = await this.getHistory({
            ...filters,
            limit: 10000,
        });

        const headers = [
            'ID',
            'Event ID',
            'Event Type',
            'Operation Type',
            'Source Service',
            'Target Services',
            'Entity Type',
            'Entity ID',
            'Status',
            'Duration (ms)',
            'Error Message',
            'Retry Count',
            'Timestamp',
        ];

        const rows = history.data.map((op) => [
            op.id,
            op.eventId,
            op.eventType,
            op.operationType,
            op.sourceService,
            op.targetServices.join(','),
            op.entityType,
            op.entityId,
            op.status,
            op.duration,
            op.errorMessage || '',
            op.retryCount,
            new Date(op.timestamp).toISOString(),
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map((row) =>
                row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','),
            ),
        ].join('\n');

        return csvContent;
    }

    /**
     * Purger les anciennes operations
     */
    async purgeOldOperations(daysOld: number = 90): Promise<number> {
        const cutoffTime = Date.now() - daysOld * 24 * 60 * 60 * 1000;

        const allIds = await this.redis.zrevrange(this.HISTORY_INDEX, 0, -1);

        let purgedCount = 0;
        for (const id of allIds) {
            const key = `${this.HISTORY_PREFIX}${id}`;
            const data = await this.redis.get(key);
            if (data) {
                const op = JSON.parse(data) as OperationLog;
                if (new Date(op.timestamp).getTime() < cutoffTime) {
                    await this.redis.del(key);
                    await this.redis.zrem(this.HISTORY_INDEX, id);
                    purgedCount++;
                }
            }
        }

        this.logger.log(`Purged ${purgedCount} old operations from Redis`);
        return purgedCount;
    }

    /**
     * Health check
     */
    async healthCheck(): Promise<boolean> {
        try {
            const ping = await this.redis.ping();
            return ping === 'PONG';
        } catch {
            return false;
        }
    }

    /**
     * Appliquer les filtres
     */
    private applyFilters(operations: OperationLog[], filters: HistoryFilter): OperationLog[] {
        return operations.filter((op) => {
            if (filters.eventType && !op.eventType.includes(filters.eventType)) {
                return false;
            }
            if (filters.operationType && op.operationType !== filters.operationType) {
                return false;
            }
            if (filters.status && op.status !== filters.status) {
                return false;
            }
            if (filters.startDate && new Date(op.timestamp) < filters.startDate) {
                return false;
            }
            if (filters.endDate && new Date(op.timestamp) > filters.endDate) {
                return false;
            }
            if (filters.entityId && op.entityId !== filters.entityId) {
                return false;
            }
            if (filters.sourceService && op.sourceService !== filters.sourceService) {
                return false;
            }
            if (filters.targetService && !op.targetServices.includes(filters.targetService)) {
                return false;
            }
            return true;
        });
    }

    /**
     * Calculer les stats
     */
    private calculateStats(operations: OperationLog[]): Omit<HistoryStats, 'uptime'> {
        const stats = this.createEmptyStats();

        if (operations.length === 0) {
            return stats;
        }

        stats.totalOperations = operations.length;
        let totalDuration = 0;

        for (const op of operations) {
            if (op.status === 'SUCCESS') stats.successCount++;
            else if (op.status === 'FAILED') stats.failureCount++;
            else if (op.status === 'PENDING') stats.pendingCount++;

            stats.operationsByType[op.operationType] =
                (stats.operationsByType[op.operationType] || 0) + 1;
            stats.operationsByStatus[op.status] =
                (stats.operationsByStatus[op.status] || 0) + 1;

            totalDuration += op.duration;

            const opTimestamp = new Date(op.timestamp);
            if (!stats.lastOperationAt || opTimestamp > stats.lastOperationAt) {
                stats.lastOperationAt = opTimestamp;
            }
        }

        stats.averageDuration = Math.round(totalDuration / operations.length);
        stats.failureRate =
            Math.round(((stats.failureCount + stats.pendingCount) / operations.length) * 10000) / 100;

        return stats;
    }

    /**
     * Creer des stats vides
     */
    private createEmptyStats(): Omit<HistoryStats, 'uptime'> {
        return {
            totalOperations: 0,
            successCount: 0,
            failureCount: 0,
            pendingCount: 0,
            averageDuration: 0,
            operationsByType: {},
            operationsByStatus: {},
            failureRate: 0,
            lastOperationAt: null,
        };
    }

    /**
     * Initialiser les stats
     */
    private initializeStats(): HistoryStats {
        return {
            ...this.createEmptyStats(),
            uptime: '0s',
        };
    }

    /**
     * Mettre a jour les stats
     */
    private async updateStats(operation: OperationLog): Promise<void> {
        try {
            const stats = await this.getStats();

            stats.totalOperations++;
            if (operation.status === 'SUCCESS') stats.successCount++;
            else if (operation.status === 'FAILED') stats.failureCount++;
            else if (operation.status === 'PENDING') stats.pendingCount++;

            stats.operationsByType[operation.operationType] =
                (stats.operationsByType[operation.operationType] || 0) + 1;
            stats.operationsByStatus[operation.status] =
                (stats.operationsByStatus[operation.status] || 0) + 1;

            stats.lastOperationAt = operation.timestamp;

            const totalOps = stats.successCount + stats.failureCount + stats.pendingCount;
            if (totalOps > 0) {
                stats.failureRate =
                    Math.round(((stats.failureCount + stats.pendingCount) / totalOps) * 10000) / 100;
            }

            await this.redis.set(this.STATS_KEY, JSON.stringify(stats));
        } catch (error) {
            this.logger.debug(`Failed to update stats: ${error.message}`);
        }
    }

    /**
     * Generer un ID unique
     */
    private generateId(): string {
        return crypto.randomBytes(8).toString('hex');
    }
}