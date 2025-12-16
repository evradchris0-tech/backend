import { 
    PasswordsGeneratedEventPayload, 
    EmailSentRecord 
} from './shared-event.interfaces';

// Re-export pour compatibilite
export { PasswordsGeneratedEventPayload, EmailSentRecord };

/**
 * Domain Event: Passwords Generated
 * 
 * Publie par: Auth-Service
 * Scenario: Quand les passwords temporaires ont ete generes et envoyes par email
 * 
 * Ecoute par: Sync-Service (pour audit trail)
 */
export class PasswordsGeneratedEvent {
    constructor(
        public readonly eventId: string,
        public readonly occurredAt: string,
        public readonly userIds: string[],
        public readonly emailsSent: EmailSentRecord[],
        public readonly successCount: number,
        public readonly failureCount: number,
    ) {}

    static fromPayload(payload: PasswordsGeneratedEventPayload): PasswordsGeneratedEvent {
        return new PasswordsGeneratedEvent(
            payload.eventId,
            payload.occurredAt,
            payload.userIds,
            payload.emailsSent,
            payload.successCount,
            payload.failureCount,
        );
    }

    toPayload(): PasswordsGeneratedEventPayload {
        return {
            eventId: this.eventId,
            eventType: 'PASSWORDS_GENERATED',
            occurredAt: this.occurredAt,
            userIds: this.userIds,
            emailsSent: this.emailsSent,
            successCount: this.successCount,
            failureCount: this.failureCount,
        };
    }
}