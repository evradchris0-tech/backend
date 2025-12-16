import { Injectable, Logger } from '@nestjs/common';
import { OperationHistoryService } from '../services/operation-history.service';
import { UsersImportedEvent } from '../../../shared/src/domain/events/users-imported.event';
/**
 * Event Handler: UsersImportedEvent (dans SyncService)
 * 
 * Responsabilité: Enregistrer dans l'audit trail quand des utilisateurs
 * ont été importés depuis un fichier CSV
 */
@Injectable()
export class UsersImportedEventHandler {
    private readonly logger = new Logger('UsersImportedEventHandler[SyncService]');

    constructor(
        private readonly operationHistoryService: OperationHistoryService,
    ) {}

    async handle(event: UsersImportedEvent): Promise<void> {
        this.logger.log(
            `Recording UsersImportedEvent [${event.eventId}]: ${event.importedCount} users imported`,
        );

        try {
            // Enregistrer l'opération dans l'audit trail
            await this.operationHistoryService.logOperation({
                eventId: event.eventId,
                eventType: 'USERS_IMPORTED',
                operationType: 'CREATED',
                sourceService: 'user-service',
                targetServices: ['sync-service'],
                entityType: 'USER_IMPORT',
                entityId: event.eventId,
                status: event.failedCount === 0 ? 'SUCCESS' : 'FAILED',
                duration: 0,
                retryCount: 0,
                timestamp: new Date(event.occurredAt),
                metadata: {
                    importedCount: event.importedCount,
                    failedCount: event.failedCount,
                    users: event.userIds,
                    filename: event.filename,
                    totalRows: event.totalRows,
                },
            });

            // Log un warning si des imports ont échoué
            if (event.failedCount > 0) {
                const failureRate = Math.round(
                    (event.failedCount / event.totalRows) * 100,
                );
                this.logger.warn(
                    `Import completed with ${event.failedCount} failures (${failureRate}%). Check audit trail for details.`,
                );
            }

            this.logger.log(`Event recorded in audit trail: ${event.eventId}`);
        } catch (error) {
            this.logger.error(
                `Failed to record UsersImportedEvent: ${error.message}`,
                error.stack,
            );
        }
    }
}