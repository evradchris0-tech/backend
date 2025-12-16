// src/infrastructure/rabbitmq/user-role-sync.handler.ts

import { Injectable, Logger } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { IAuthUserRepository } from '../../domain/repositories/auth-user.repository.interface';

/**
 * Événement reçu lors de la création d'un utilisateur dans User-Service
 */
interface UserCreatedEvent {
    userId: string;
    email: string;
    role: string;
    status: string;
    firstName?: string;
    lastName?: string;
    createdAt: string;
}

/**
 * Événement reçu lors de la mise à jour d'un utilisateur dans User-Service
 */
interface UserUpdatedEvent {
    userId: string;
    email?: string;
    updatedFields: {
        role?: string;
        status?: string;
        firstName?: string;
        lastName?: string;
    };
    updatedAt: string;
}

/**
 * Handler RabbitMQ pour synchroniser les rôles utilisateurs
 * depuis User-Service vers Auth-Service
 * 
 * Écoute les événements:
 * - user.created: Synchronise le rôle lors de la création
 * - user.updated: Synchronise le rôle lors de la mise à jour
 */
@Injectable()
export class UserRoleSyncHandler {
    private readonly logger = new Logger(UserRoleSyncHandler.name);

    constructor(
        private readonly authUserRepository: IAuthUserRepository,
    ) {}

    /**
     * Écoute l'événement user.created
     * Exchange: user-domain-events
     * Queue: auth-service.user-role-sync
     * Routing Key: user.created
     */
    @RabbitSubscribe({
        exchange: 'user-domain-events',
        routingKey: 'user.created',
        queue: 'auth-service.user-role-sync',
    })
    async handleUserCreated(event: UserCreatedEvent): Promise<void> {
        this.logger.log(`Received user.created event for user ${event.userId}`);

        try {
            // Récupérer l'utilisateur auth correspondant par email
            const authUser = await this.authUserRepository.findByEmail(event.email);

            if (!authUser) {
                this.logger.warn(
                    `Auth user not found for email ${event.email}. Skipping role sync.`,
                );
                return;
            }

            // Synchroniser le rôle
            authUser.syncRole(event.role);
            await this.authUserRepository.save(authUser);

            this.logger.log(
                `Successfully synced role "${event.role}" for user ${event.userId} (email: ${event.email})`,
            );
        } catch (error) {
            this.logger.error(
                `Failed to sync role for user ${event.userId}: ${error.message}`,
                error.stack,
            );
            // En production, vous pourriez vouloir envoyer l'événement dans une DLQ
            throw error;
        }
    }

    /**
     * Écoute l'événement user.updated
     * Exchange: user-domain-events
     * Queue: auth-service.user-role-sync
     * Routing Key: user.updated
     */
    @RabbitSubscribe({
        exchange: 'user-domain-events',
        routingKey: 'user.updated',
        queue: 'auth-service.user-role-sync',
    })
    async handleUserUpdated(event: UserUpdatedEvent): Promise<void> {
        this.logger.log(`Received user.updated event for user ${event.userId}`);

        try {
            // Vérifier si le rôle a été modifié
            if (!event.updatedFields.role) {
                this.logger.debug(
                    `Role not updated for user ${event.userId}. Skipping sync.`,
                );
                return;
            }

            // Récupérer l'utilisateur auth correspondant
            const authUser = await this.authUserRepository.findById(event.userId);

            if (!authUser) {
                // Si l'email a changé, chercher par le nouvel email
                if (event.email) {
                    const authUserByEmail = await this.authUserRepository.findByEmail(
                        event.email,
                    );
                    if (!authUserByEmail) {
                        this.logger.warn(
                            `Auth user not found for user ID ${event.userId}. Skipping role sync.`,
                        );
                        return;
                    }
                    authUserByEmail.syncRole(event.updatedFields.role);
                    await this.authUserRepository.save(authUserByEmail);
                } else {
                    this.logger.warn(
                        `Auth user not found for user ID ${event.userId}. Skipping role sync.`,
                    );
                    return;
                }
            } else {
                // Synchroniser le nouveau rôle
                authUser.syncRole(event.updatedFields.role);
                await this.authUserRepository.save(authUser);
            }

            this.logger.log(
                `Successfully synced role "${event.updatedFields.role}" for user ${event.userId}`,
            );
        } catch (error) {
            this.logger.error(
                `Failed to sync role for user ${event.userId}: ${error.message}`,
                error.stack,
            );
            throw error;
        }
    }
}