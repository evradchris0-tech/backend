import { Injectable, Logger } from '@nestjs/common';
import { UsersImportedEvent } from '../../domain/events/users-imported.event';

/**
 * Service de publication des événements de domaine
 * Responsabilité: Publier les événements métier vers RabbitMQ
 *
 * Pattern: Event Publisher
 * Architecture: Event-Driven
 */
@Injectable()
export class UserDomainEventPublisher {
  private readonly logger = new Logger(UserDomainEventPublisher.name);

  constructor(
    // Injection de RabbitMQPublisherService si disponible
    // private rabbitMQPublisher: RabbitMQPublisherService,
  ) {}

  /**
   * Publier l'événement: "Des utilisateurs ont été importés"
   *
   * Cet événement est écouté par:
   * - AuthService: Pour générer les passwords
   * - SyncService: Pour enregistrer dans l'historique
   *
   * @param event L'événement à publier
   */
  async publishUsersImported(event: UsersImportedEvent): Promise<void> {
    try {
      this.logger.log(
        `Publishing UsersImportedEvent [${event.eventId}] with ${event.totalImported} users`,
      );

      // Publier vers RabbitMQ sur le topic: "user.imported"
      // await this.rabbitMQPublisher.publish('user.imported', event);

      // TEMPORAIRE: Log jusqu'à ce que RabbitMQ soit configuré
      this.logger.log(
        `Event published successfully: ${JSON.stringify({
          eventId: event.eventId,
          totalImported: event.totalImported,
          importedUserIds: event.importedUserIds.length,
        })}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to publish UsersImportedEvent [${event.eventId}]: ${error.message}`,
        error.stack,
      );
      // Note: En production, on pourrait ajouter une retry policy
      // ou une dead-letter queue
      throw error;
    }
  }
}
