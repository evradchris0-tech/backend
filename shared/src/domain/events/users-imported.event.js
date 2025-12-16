"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersImportedEventPayload = void 0;
class UsersImportedEventPayload {
    constructor(eventId, importedCount, failedCount, userIds, filename, totalRows, importedAt, occurredAt, errors, metadata) {
        this.eventId = eventId;
        this.importedCount = importedCount;
        this.failedCount = failedCount;
        this.userIds = userIds;
        this.filename = filename;
        this.totalRows = totalRows;
        this.importedAt = importedAt;
        this.occurredAt = occurredAt;
        this.errors = errors;
        this.metadata = metadata;
    }
    static create(params) {
        const now = new Date();
        return new UsersImportedEventPayload(`users-imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, params.importedCount, params.failedCount, params.userIds, params.filename, params.totalRows, now, now.toISOString(), params.errors, params.metadata);
    }
}
exports.UsersImportedEventPayload = UsersImportedEventPayload;
//# sourceMappingURL=users-imported.event.js.map