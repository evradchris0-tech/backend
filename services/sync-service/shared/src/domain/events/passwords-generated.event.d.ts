export interface EmailSentRecord {
    userId: string;
    email: string;
    sentAt: string;
    status: 'success' | 'failed';
    messageId?: string;
    error?: string;
}
export interface PasswordsGeneratedEventPayload {
    eventId: string;
    eventType: 'PASSWORDS_GENERATED';
    occurredAt: string;
    userIds: string[];
    emailsSent: EmailSentRecord[];
    successCount: number;
    failureCount: number;
}
