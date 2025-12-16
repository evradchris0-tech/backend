import { Injectable, Logger } from '@nestjs/common';
import { OperationLog, HistoryFilter, HistoryResponse, HistoryStats } from './operation-history.service';

/**
 * Null Object Pattern implementation for PostgresHistoryService.
 * Used when PostgreSQL is disabled to avoid null checks throughout the codebase.
 */
@Injectable()
export class NullPostgresHistoryService {
    private readonly logger = new Logger(NullPostgresHistoryService.name);

    constructor() {
        this.logger.log('NullPostgresHistoryService initialized (PostgreSQL disabled)');
    }

    async persistOperations(operations: OperationLog[]): Promise<void> {
        this.logger.debug(`Skipping persistence of ${operations.length} operations (PostgreSQL disabled)`);
    }

    async getHistory(filters: HistoryFilter = {}): Promise<HistoryResponse> {
        return {
            data: [],
            total: 0,
            hasMore: false,
            limit: filters.limit || 50,
            offset: filters.offset || 0,
        };
    }

    async getEntityHistory(entityId: string, limit: number = 100): Promise<OperationLog[]> {
        return [];
    }

    async getEventHistory(eventId: string): Promise<OperationLog[]> {
        return [];
    }

    async getStats(): Promise<HistoryStats> {
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
            uptime: '0s',
        };
    }

    async purgeOldOperations(daysOld: number = 90): Promise<number> {
        return 0;
    }
}