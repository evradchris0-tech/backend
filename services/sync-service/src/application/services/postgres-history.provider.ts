import { Provider, Logger } from '@nestjs/common';
import { PostgresHistoryService } from './postgres-history.service';
import { NullPostgresHistoryService } from './null-postgres-history.service';

export const POSTGRES_HISTORY_SERVICE = 'POSTGRES_HISTORY_SERVICE';

/**
 * Provider factory for PostgresHistoryService.
 * Returns the real service if PostgreSQL is enabled, otherwise returns NullPostgresHistoryService.
 */
export const PostgresHistoryProvider: Provider = {
    provide: POSTGRES_HISTORY_SERVICE,
    useFactory: (...deps: any[]) => {
        const logger = new Logger('PostgresHistoryProvider');
        const isEnabled = process.env.POSTGRES_HISTORY_ENABLED === 'true';

        if (isEnabled) {
            logger.log('PostgreSQL history enabled, using PostgresHistoryService');
            // deps[0] sera le Repository injecte par DatabaseModule
            // Cette logique sera geree par DatabaseModule
            return null; // Sera remplace par DatabaseModule
        }

        logger.log('PostgreSQL history disabled, using NullPostgresHistoryService');
        return new NullPostgresHistoryService();
    },
};