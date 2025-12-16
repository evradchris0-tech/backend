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
export declare class UsersImportedEventPayload implements UsersImportedEvent {
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
    constructor(eventId: string, importedCount: number, failedCount: number, userIds: string[], filename: string, totalRows: number, importedAt: Date, occurredAt: string | Date, errors?: Array<{
        row: number;
        email: string;
        reason: string;
    }>, metadata?: Record<string, any>);
    static create(params: {
        importedCount: number;
        failedCount: number;
        userIds: string[];
        filename: string;
        totalRows: number;
        errors?: Array<{
            row: number;
            email: string;
            reason: string;
        }>;
        metadata?: Record<string, any>;
    }): UsersImportedEventPayload;
}
