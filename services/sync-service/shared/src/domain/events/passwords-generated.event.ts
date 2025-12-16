/**
 * Domain Event: PasswordsGeneratedEvent
 * 
 * ⚠️  SHARED ACROSS MICROSERVICES
 * 
 * Cette interface doit être identique dans tous les microservices
 * qui reçoivent cet événement via RabbitMQ.
 */

export interface EmailSentRecord {
    userId: string;
    email: string;
    sentAt: string; // ISO 8601 timestamp
    status: 'success' | 'failed';
    messageId?: string;
    error?: string;
}

export interface PasswordsGeneratedEventPayload {
    eventId: string;
    eventType: 'PASSWORDS_GENERATED';
    occurredAt: string; // ISO 8601 timestamp
    userIds: string[];
    emailsSent: EmailSentRecord[];
    successCount: number;
    failureCount: number;
}
