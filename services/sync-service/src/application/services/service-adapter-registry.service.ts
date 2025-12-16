import { Injectable } from '@nestjs/common';

export interface ServiceAdapter {
    serviceName: string;
    syncUserCreated(data: any): Promise<void>;
    syncUserUpdated(data: any): Promise<void>;
    syncUserDeleted(data: any): Promise<void>;
}

@Injectable()
export class ServiceAdapterRegistry {
    private adapters: Map<string, ServiceAdapter> = new Map();

    registerAdapter(adapter: ServiceAdapter): void {
        this.adapters.set(adapter.serviceName, adapter);
        console.log(`✅ Registered adapter: ${adapter.serviceName}`);
    }

    getAdapter(serviceName: string): ServiceAdapter | undefined {
        return this.adapters.get(serviceName);
    }

    getAllAdapters(): ServiceAdapter[] {
        return Array.from(this.adapters.values());
    }
}