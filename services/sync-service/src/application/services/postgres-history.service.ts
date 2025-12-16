import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OperationLogEntity } from '../../infrastructure/database/entities/operation-log.entity';
import { OperationLog, HistoryFilter, HistoryResponse, HistoryStats } from './operation-history.service';

@Injectable()
export class PostgresHistoryService {
    private readonly logger = new Logger(PostgresHistoryService.name);

    constructor(
        @InjectRepository(OperationLogEntity)
        private readonly operationLogRepository: Repository<OperationLogEntity>,
    ) {}

    /**
     * Persister un batch d'opérations en PostgreSQL
     */
    async persistOperations(operations: OperationLog[]): Promise<void> {
        try {
            const entities = operations.map((op) => {
                const entity = new OperationLogEntity();
                entity.id = op.id;
                entity.eventId = op.eventId;
                entity.eventType = op.eventType;
                entity.operationType = op.operationType;
                entity.sourceService = op.sourceService;
                entity.targetServices = op.targetServices;
                entity.entityType = op.entityType;
                entity.entityId = op.entityId;
                entity.status = op.status;
                entity.duration = op.duration;
                entity.errorMessage = op.errorMessage;
                entity.retryCount = op.retryCount;
                entity.timestamp = op.timestamp;
                entity.userId = op.userId;
                entity.metadata = op.metadata;
                return entity;
            });

            await this.operationLogRepository.save(entities, { chunk: 100 });
            this.logger.debug(`Persisted ${operations.length} operations to PostgreSQL`);
        } catch (error) {
            this.logger.error('Failed to persist operations to PostgreSQL', error);
            throw error;
        }
    }

    /**
     * Récupérer l'historique depuis PostgreSQL avec filtres
     */
    async getHistory(filters: HistoryFilter = {}): Promise<HistoryResponse> {
        const limit = Math.min(filters.limit || 50, 500);
        const offset = filters.offset || 0;

        try {
            const queryBuilder = this.operationLogRepository.createQueryBuilder('op');

            // Appliquer les filtres
            if (filters.eventType) {
                queryBuilder.andWhere('op.eventType ILIKE :eventType', {
                    eventType: `%${filters.eventType}%`,
                });
            }

            if (filters.operationType) {
                queryBuilder.andWhere('op.operationType = :operationType', {
                    operationType: filters.operationType,
                });
            }

            if (filters.status) {
                queryBuilder.andWhere('op.status = :status', {
                    status: filters.status,
                });
            }

            if (filters.startDate && filters.endDate) {
                queryBuilder.andWhere('op.timestamp BETWEEN :start AND :end', {
                    start: filters.startDate,
                    end: filters.endDate,
                });
            } else if (filters.startDate) {
                queryBuilder.andWhere('op.timestamp >= :start', {
                    start: filters.startDate,
                });
            } else if (filters.endDate) {
                queryBuilder.andWhere('op.timestamp <= :end', {
                    end: filters.endDate,
                });
            }

            if (filters.entityId) {
                queryBuilder.andWhere('op.entityId = :entityId', {
                    entityId: filters.entityId,
                });
            }

            if (filters.sourceService) {
                queryBuilder.andWhere('op.sourceService = :sourceService', {
                    sourceService: filters.sourceService,
                });
            }

            if (filters.targetService) {
                queryBuilder.andWhere(':targetService = ANY(op.targetServices)', {
                    targetService: filters.targetService,
                });
            }

            // Compter le total et récupérer les données en parallèle
            const [entities, total] = await queryBuilder
                .orderBy('op.timestamp', 'DESC')
                .skip(offset)
                .take(limit)
                .getManyAndCount();

            const data: OperationLog[] = entities.map((entity) => ({
                id: entity.id,
                eventId: entity.eventId,
                eventType: entity.eventType,
                operationType: entity.operationType,
                sourceService: entity.sourceService,
                targetServices: entity.targetServices,
                entityType: entity.entityType,
                entityId: entity.entityId,
                status: entity.status,
                duration: entity.duration,
                errorMessage: entity.errorMessage,
                retryCount: entity.retryCount,
                timestamp: entity.timestamp,
                userId: entity.userId,
                metadata: entity.metadata,
            }));

            return {
                data,
                total,
                hasMore: offset + limit < total,
                limit,
                offset,
            };
        } catch (error) {
            this.logger.error('Failed to get history from PostgreSQL', error);
            throw error;
        }
    }

    /**
     * Récupérer l'historique d'une entité spécifique
     */
    async getEntityHistory(entityId: string, limit: number = 100): Promise<OperationLog[]> {
        try {
            const entities = await this.operationLogRepository.find({
                where: { entityId },
                order: { timestamp: 'DESC' },
                take: limit,
            });

            return entities.map((entity) => ({
                id: entity.id,
                eventId: entity.eventId,
                eventType: entity.eventType,
                operationType: entity.operationType,
                sourceService: entity.sourceService,
                targetServices: entity.targetServices,
                entityType: entity.entityType,
                entityId: entity.entityId,
                status: entity.status,
                duration: entity.duration,
                errorMessage: entity.errorMessage,
                retryCount: entity.retryCount,
                timestamp: entity.timestamp,
                userId: entity.userId,
                metadata: entity.metadata,
            }));
        } catch (error) {
            this.logger.error(`Failed to get entity history for ${entityId}`, error);
            throw error;
        }
    }

    /**
     * Récupérer l'historique d'un événement spécifique
     */
    async getEventHistory(eventId: string): Promise<OperationLog[]> {
        try {
            const entities = await this.operationLogRepository.find({
                where: { eventId },
                order: { timestamp: 'DESC' },
            });

            return entities.map((entity) => ({
                id: entity.id,
                eventId: entity.eventId,
                eventType: entity.eventType,
                operationType: entity.operationType,
                sourceService: entity.sourceService,
                targetServices: entity.targetServices,
                entityType: entity.entityType,
                entityId: entity.entityId,
                status: entity.status,
                duration: entity.duration,
                errorMessage: entity.errorMessage,
                retryCount: entity.retryCount,
                timestamp: entity.timestamp,
                userId: entity.userId,
                metadata: entity.metadata,
            }));
        } catch (error) {
            this.logger.error('Failed to get event history', error);
            throw error;
        }
    }

    /**
     * Obtenir les statistiques globales depuis PostgreSQL
     */
    async getStats(): Promise<HistoryStats> {
        try {
            const qb = this.operationLogRepository.createQueryBuilder('op');

            // Statistiques globales
            const [
                totalOperations,
                successCount,
                failureCount,
                pendingCount,
                avgDuration,
                lastOperation,
            ] = await Promise.all([
                qb.getCount(),
                this.operationLogRepository.count({ where: { status: 'SUCCESS' } }),
                this.operationLogRepository.count({ where: { status: 'FAILED' } }),
                this.operationLogRepository.count({ where: { status: 'PENDING' } }),
                this.operationLogRepository
                    .createQueryBuilder('op')
                    .select('AVG(op.duration)', 'avg')
                    .getRawOne(),
                this.operationLogRepository.findOne({
                    where: {},
                    order: { timestamp: 'DESC' },
                }),
            ]);

            // Statistiques par type d'opération
            const operationsByTypeRaw = await this.operationLogRepository
                .createQueryBuilder('op')
                .select('op.operationType', 'type')
                .addSelect('COUNT(*)', 'count')
                .groupBy('op.operationType')
                .getRawMany();

            const operationsByType: Record<string, number> = {};
            operationsByTypeRaw.forEach((row) => {
                operationsByType[row.type] = parseInt(row.count, 10);
            });

            // Statistiques par statut
            const operationsByStatusRaw = await this.operationLogRepository
                .createQueryBuilder('op')
                .select('op.status', 'status')
                .addSelect('COUNT(*)', 'count')
                .groupBy('op.status')
                .getRawMany();

            const operationsByStatus: Record<string, number> = {};
            operationsByStatusRaw.forEach((row) => {
                operationsByStatus[row.status] = parseInt(row.count, 10);
            });

            const averageDuration = Math.round(parseFloat(avgDuration?.avg || '0'));
            const failureRate =
                totalOperations > 0
                    ? Math.round(((failureCount + pendingCount) / totalOperations) * 10000) / 100
                    : 0;

            // Calculer l'uptime basé sur la première opération
            const firstOperation = await this.operationLogRepository.findOne({
                where: {},
                order: { timestamp: 'ASC' },
            });

            let uptime = '0s';
            if (firstOperation) {
                const uptimeMs = Date.now() - firstOperation.timestamp.getTime();
                uptime = this.formatUptime(uptimeMs);
            }

            return {
                totalOperations,
                successCount,
                failureCount,
                pendingCount,
                averageDuration,
                operationsByType,
                operationsByStatus,
                failureRate,
                lastOperationAt: lastOperation?.timestamp || null,
                uptime,
            };
        } catch (error) {
            this.logger.error('Failed to get stats from PostgreSQL', error);
            throw error;
        }
    }

    /**
     * Formater l'uptime en format lisible
     */
    private formatUptime(ms: number): string {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) {
            return `${days}d ${hours % 24}h`;
        } else if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }

    /**
     * Purger les opérations anciennes
     */
    async purgeOldOperations(daysOld: number = 90): Promise<number> {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);

            const result = await this.operationLogRepository
                .createQueryBuilder()
                .delete()
                .where('timestamp < :cutoffDate', { cutoffDate })
                .execute();

            this.logger.log(`Purged ${result.affected || 0} old operations from PostgreSQL`);
            return result.affected || 0;
        } catch (error) {
            this.logger.error('Failed to purge old operations from PostgreSQL', error);
            throw error;
        }
    }
}