// src/infrastructure/rabbitmq/rabbitmq-publisher.service.ts

import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

/**
 * Interface pour l'événement de création d'utilisateur
 */
export interface UserCreatedEvent {
    userId: string;
    email: string;
    role: string;
    status: string;
    firstName?: string;
    lastName?: string;
    createdAt: string;
}

/**
 * Interface pour l'événement de mise à jour d'utilisateur
 */
export interface UserUpdatedEvent {
    userId: string;
    email?: string;
    updatedFields: {
        role?: string;
        status?: string;
        firstName?: string;
        lastName?: string;
        email?: string;
    };
    updatedAt: string;
}

/**
 * Interface pour l'événement de suppression d'utilisateur
 */
export interface UserDeletedEvent {
    userId: string;
    email: string;
    deletedAt: string;
}

/**
 * Service de publication d'événements RabbitMQ
 * Publie les événements du domaine User vers l'exchange user-domain-events
 */
@Injectable()
export class RabbitMQPublisherService implements OnModuleDestroy {
    private readonly logger = new Logger(RabbitMQPublisherService.name);
    private readonly exchange = 'user-domain-events';

    constructor(
        private readonly amqpConnection: AmqpConnection,
        private readonly configService: ConfigService,
    ) {}

    /**
     * Publie un événement user.created
     * Appelé après la création réussie d'un utilisateur
     */
    async publishUserCreated(event: UserCreatedEvent): Promise<void> {
        const routingKey = 'user.created';

        try {
            await this.amqpConnection.publish(
                this.exchange,
                routingKey,
                event,
                {
                    persistent: true,
                    contentType: 'application/json',
                    timestamp: Date.now(),
                    headers: {
                        'x-event-type': 'user.created',
                        'x-source-service': 'user-service',
                    },
                },
            );

            this.logger.log(
                `Published user.created event for user ${event.userId} (email: ${event.email}, role: ${event.role})`,
            );
        } catch (error) {
            this.logger.error(
                `Failed to publish user.created event for user ${event.userId}: ${error.message}`,
                error.stack,
            );
            // Ne pas relancer l'erreur pour ne pas bloquer la création
            // En production, envisager une stratégie de retry ou outbox pattern
        }
    }

    /**
     * Publie un événement user.updated
     * Appelé après la mise à jour réussie d'un utilisateur
     */
    async publishUserUpdated(event: UserUpdatedEvent): Promise<void> {
        const routingKey = 'user.updated';

        try {
            await this.amqpConnection.publish(
                this.exchange,
                routingKey,
                event,
                {
                    persistent: true,
                    contentType: 'application/json',
                    timestamp: Date.now(),
                    headers: {
                        'x-event-type': 'user.updated',
                        'x-source-service': 'user-service',
                    },
                },
            );

            this.logger.log(
                `Published user.updated event for user ${event.userId} (fields: ${Object.keys(event.updatedFields).join(', ')})`,
            );
        } catch (error) {
            this.logger.error(
                `Failed to publish user.updated event for user ${event.userId}: ${error.message}`,
                error.stack,
            );
        }
    }

    /**
     * Publie un événement user.deleted
     * Appelé après la suppression réussie d'un utilisateur
     */
    async publishUserDeleted(event: UserDeletedEvent): Promise<void> {
        const routingKey = 'user.deleted';

        try {
            await this.amqpConnection.publish(
                this.exchange,
                routingKey,
                event,
                {
                    persistent: true,
                    contentType: 'application/json',
                    timestamp: Date.now(),
                    headers: {
                        'x-event-type': 'user.deleted',
                        'x-source-service': 'user-service',
                    },
                },
            );

            this.logger.log(
                `Published user.deleted event for user ${event.userId} (email: ${event.email})`,
            );
        } catch (error) {
            this.logger.error(
                `Failed to publish user.deleted event for user ${event.userId}: ${error.message}`,
                error.stack,
            );
        }
    }

    /**
     * Publie un événement user.role.changed
     * Événement spécifique pour les changements de rôle (routage optimisé)
     */
    async publishUserRoleChanged(
        userId: string,
        email: string,
        oldRole: string,
        newRole: string,
    ): Promise<void> {
        const routingKey = 'user.role.changed';

        try {
            const event = {
                userId,
                email,
                oldRole,
                newRole,
                changedAt: new Date().toISOString(),
            };

            await this.amqpConnection.publish(
                this.exchange,
                routingKey,
                event,
                {
                    persistent: true,
                    contentType: 'application/json',
                    timestamp: Date.now(),
                    headers: {
                        'x-event-type': 'user.role.changed',
                        'x-source-service': 'user-service',
                    },
                },
            );

            this.logger.log(
                `Published user.role.changed event for user ${userId}: ${oldRole} -> ${newRole}`,
            );
        } catch (error) {
            this.logger.error(
                `Failed to publish user.role.changed event for user ${userId}: ${error.message}`,
                error.stack,
            );
        }
    }

    /**
     * Publie un événement user.status.changed
     * Événement spécifique pour les changements de statut
     */
    async publishUserStatusChanged(
        userId: string,
        email: string,
        oldStatus: string,
        newStatus: string,
    ): Promise<void> {
        const routingKey = 'user.status.changed';

        try {
            const event = {
                userId,
                email,
                oldStatus,
                newStatus,
                changedAt: new Date().toISOString(),
            };

            await this.amqpConnection.publish(
                this.exchange,
                routingKey,
                event,
                {
                    persistent: true,
                    contentType: 'application/json',
                    timestamp: Date.now(),
                    headers: {
                        'x-event-type': 'user.status.changed',
                        'x-source-service': 'user-service',
                    },
                },
            );

            this.logger.log(
                `Published user.status.changed event for user ${userId}: ${oldStatus} -> ${newStatus}`,
            );
        } catch (error) {
            this.logger.error(
                `Failed to publish user.status.changed event for user ${userId}: ${error.message}`,
                error.stack,
            );
        }
    }

    /**
     * Nettoyage lors de l'arrêt du module
     */
    async onModuleDestroy(): Promise<void> {
        this.logger.log('RabbitMQ Publisher shutting down');
    }
}