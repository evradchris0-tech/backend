// src/application/services/user-domain-event-publisher.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { RabbitMQPublisherService } from '../../infrastructure/events/rabbitmq-publisher.service';
import { UsersImportedEvent } from '../../domain/events/users-imported.event';

@Injectable()
export class UserDomainEventPublisher {
    private readonly logger = new Logger(UserDomainEventPublisher.name);

    constructor(
        private readonly rabbitMQPublisher: RabbitMQPublisherService,
    ) {}

    /**
     * Publier l'evenement: "Des utilisateurs ont ete importes"
     */
    async publishUsersImported(event: UsersImportedEvent): Promise<void> {
        try {
            this.logger.log(
                `Publishing UsersImportedEvent [${event.eventId}] with ${event.totalImported} users`,
            );

            // Note: RabbitMQPublisherService n'a pas de methode pour cet evenement
            // Pour l'instant, on log uniquement
            this.logger.log(
                `Event logged: ${JSON.stringify({
                    eventId: event.eventId,
                    totalImported: event.totalImported,
                })}`,
            );
        } catch (error) {
            this.logger.error(
                `Failed to publish UsersImportedEvent: ${error.message}`,
            );
        }
    }
}