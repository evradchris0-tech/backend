/**
 * Interfaces partagees - Copie locale pour compilation independante
 * 
 * IMPORTANT: Ces interfaces doivent rester synchronisees avec shared/src/domain/events/
 * En production, utiliser un package npm prive pour centraliser ces definitions.
 */

// ============================================
// PasswordsGeneratedEvent Interfaces
// ============================================

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

// ============================================
// UsersImportedEvent Interfaces
// ============================================

export interface UsersImportedEvent {
    readonly eventId: string;
    readonly importedCount: number;
    readonly failedCount: number;
    readonly userIds: string[];
    readonly filename: string;
    readonly totalRows: number;
    readonly importedAt: Date;
    readonly occurredAt: string | Date;
    readonly errors?: Array<{
        row: number;
        email: string;
        reason: string;
    }>;
    readonly metadata?: Record<string, any>;
}

export interface UsersImportedEventPayload extends UsersImportedEvent {}