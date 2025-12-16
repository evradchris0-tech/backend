// src/application/services/event-publisher.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface UserCreatedEvent {
    userId: string;
    email: string;
    passwordEncrypted: string | null;
    status: string;
    emailVerified: boolean;
}

export interface UserUpdatedEvent {
    userId: string;
    email?: string;
    passwordEncrypted?: string;
    status?: string;
    emailVerified?: boolean;
}

@Injectable()
export class EventPublisherService {
    private readonly logger = new Logger(EventPublisherService.name);

    constructor(private readonly configService: ConfigService) { }

    async publishUserCreated(event: UserCreatedEvent): Promise<void> {
        try {
            // Pour l'instant, on fait un appel HTTP direct à auth-service
            // Plus tard, on utilisera RabbitMQ ou Kafka
            const authServiceUrl = this.configService.get<string>('AUTH_SERVICE_URL');

            const response = await fetch(`${authServiceUrl}/internal/users/sync`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Internal-Service': 'user-service',
                },
                body: JSON.stringify(event),
            });

            if (!response.ok) {
                throw new Error(`Failed to sync user to auth-service: ${response.statusText}`);
            }

            this.logger.log(`✅ User ${event.userId} synced to auth-service`);
        } catch (error) {
            this.logger.error(`❌ Failed to sync user to auth-service:`, error);
            // Ne pas bloquer la création d'utilisateur si la sync échoue
            // On pourrait mettre en queue pour réessayer plus tard
        }
    }

    async publishUserUpdated(event: UserUpdatedEvent): Promise<void> {
        try {
            const authServiceUrl = this.configService.get<string>('AUTH_SERVICE_URL');

            const response = await fetch(`${authServiceUrl}/internal/users/sync`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Internal-Service': 'user-service',
                },
                body: JSON.stringify(event),
            });

            if (!response.ok) {
                throw new Error(`Failed to update user in auth-service: ${response.statusText}`);
            }

            this.logger.log(`✅ User ${event.userId} updated in auth-service`);
        } catch (error) {
            this.logger.error(`❌ Failed to update user in auth-service:`, error);
        }
    }
}