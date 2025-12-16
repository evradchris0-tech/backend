import { Injectable } from '@nestjs/common';
import { ServiceAdapterRegistry } from '../services/service-adapter-registry.service';
import { OperationHistoryService } from '../services/operation-history.service';

@Injectable()
export class UserDeletedHandler {
    constructor(
        private readonly adapterRegistry: ServiceAdapterRegistry,
        private readonly historyService: OperationHistoryService,
    ) { }

    async handle(data: any, eventId?: string): Promise<void> {
        const adapters = this.adapterRegistry.getAllAdapters();
        const targetServices = adapters.map((a) => a.serviceName);
        const startTime = Date.now();
        let status: 'SUCCESS' | 'FAILED' = 'SUCCESS';
        let errorMessage: string | undefined;

        try {
            for (const adapter of adapters) {
                try {
                    await adapter.syncUserDeleted(data);
                } catch (error) {
                    status = 'FAILED';
                    errorMessage = `Failed to sync with ${adapter.serviceName}: ${error.message}`;
                }
            }

            // Enregistrer l'opération
            await this.historyService.logOperation({
                timestamp: new Date(),
                eventId: eventId || data.id,
                eventType: 'user.deleted',
                operationType: 'DELETED',
                sourceService: 'user-service',
                targetServices,
                entityType: 'USER',
                entityId: data.id,
                status,
                duration: Date.now() - startTime,
                errorMessage,
                retryCount: 0,
                userId: data.id,
                metadata: {
                    deletedAt: new Date().toISOString(),
                },
            });
        } catch (error) {
            // Logger l'erreur même si l'enregistrement échoue
            console.error('User deletion sync failed:', error);
            throw error;
        }
    }
}