import { Injectable, Logger } from '@nestjs/common';
import { OperationHistoryService } from '../services/operation-history.service';
import { PasswordsGeneratedEventPayload } from '../../../shared/src/domain/events/passwords-generated.event';
/**
 * Event Handler: PasswordsGeneratedEvent (dans SyncService)
 * 
 * Responsabilité: Enregistrer dans l'audit trail quand les passwords
 * ont été générés et les emails envoyés par Auth-Service
 */
@Injectable()
export class PasswordsGeneratedEventHandler {
    private readonly logger = new Logger('PasswordsGeneratedEventHandler[SyncService]');

    constructor(
        private readonly operationHistoryService: OperationHistoryService,
    ) {}

    async handle(event: PasswordsGeneratedEventPayload): Promise<void> {
        this.logger.log(
            `Recording PasswordsGeneratedEvent [${event.eventId}]: ${event.successCount} emails sent`,
        );

        try {
            // Enregistrer l'opération dans l'audit trail
            await this.operationHistoryService.logOperation({
                eventId: event.eventId,
                eventType: 'PASSWORDS_GENERATED',
                operationType: 'SYNCED',
                sourceService: 'auth-service',
                targetServices: [],
                entityType: 'PASSWORD_EMAIL',
                entityId: event.eventId,
                status: event.failureCount === 0 ? 'SUCCESS' : 'FAILED',
                duration: 0,
                retryCount: 0,
                timestamp: new Date(event.occurredAt),
                metadata: {
                    successCount: event.successCount,
                    failureCount: event.failureCount,
                    userIds: event.userIds,
                    emailsSent: event.emailsSent,
                },
            });

            this.logger.log(`Event recorded in audit trail: ${event.eventId}`);
        } catch (error) {
            this.logger.error(
                `Failed to record PasswordsGeneratedEvent: ${error.message}`,
                error.stack,
            );
        }
    }
}