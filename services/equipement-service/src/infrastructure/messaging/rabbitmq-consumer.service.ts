import { Injectable, Logger, OnModuleInit, OnModuleDestroy, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as amqp from 'amqplib';
import {
  RABBITMQ_QUEUES,
  RABBITMQ_ROUTING_KEYS,
} from '../config/rabbitmq-exchanges.config';

/**
 * Interface pour les événements infrastructure reçus
 */
interface InfrastructureEvent {
  eventName: string;
  occurredOn: string;
  aggregateId: string;
  payload: Record<string, unknown>;
  metadata?: {
    service: string;
    timestamp: string;
  };
}

/**
 * Service pour consommer des messages RabbitMQ
 * Écoute les événements d'autres services (user, infrastructure, etc.)
 */
@Injectable()
export class RabbitMQConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQConsumerService.name);
  private connection: amqp.Connection;
  private channel: amqp.Channel;

  constructor(
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async onModuleInit() {
    try {
      const rabbitmqUrl = this.configService.get<string>(
        'RABBITMQ_URL',
        'amqp://guest:guest@localhost:5672',
      );

      this.connection = await amqp.connect(rabbitmqUrl);
      this.channel = await this.connection.createChannel();

      // Setup consumers
      await this.setupConsumers();

      this.logger.log('✅ RabbitMQ Consumer connected and listening');
    } catch (error) {
      this.logger.error('❌ Failed to connect RabbitMQ Consumer', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.channel?.close();
      await this.connection?.close();
      this.logger.log('RabbitMQ Consumer disconnected');
    } catch (error) {
      this.logger.error('Error closing RabbitMQ Consumer connection', error);
    }
  }

  /**
   * Setup all consumers
   */
  private async setupConsumers(): Promise<void> {
    // Consumer pour événements utilisateurs
    await this.channel.consume(
      RABBITMQ_QUEUES.EQUIPEMENT_USER_EVENTS,
      (msg) => this.handleUserEvent(msg),
      { noAck: false },
    );

    // Consumer pour événements infrastructure
    await this.channel.consume(
      RABBITMQ_QUEUES.EQUIPEMENT_INFRASTRUCTURE_EVENTS,
      (msg) => this.handleInfrastructureEvent(msg),
      { noAck: false },
    );

    this.logger.debug('Consumers setup complete');
  }

  /**
   * Gère les événements utilisateur
   */
  private async handleUserEvent(msg: amqp.ConsumeMessage | null) {
    if (!msg) return;

    try {
      const content = msg.content.toString();
      const event = JSON.parse(content);

      this.logger.log(`📥 User event received: ${event.eventName}`);

      switch (event.eventName) {
        case 'user.created':
          await this.onUserCreated(event);
          break;

        case 'user.updated':
          await this.onUserUpdated(event);
          break;

        case 'user.deleted':
          await this.onUserDeleted(event);
          break;

        default:
          this.logger.debug(`Unhandled user event: ${event.eventName}`);
      }

      this.channel.ack(msg);
    } catch (error) {
      this.logger.error('Error handling user event', error);
      this.channel.nack(msg, false, false);
    }
  }

  /**
   * Gère les événements infrastructure
   */
  private async handleInfrastructureEvent(msg: amqp.ConsumeMessage | null) {
    if (!msg) return;

    try {
      const content = msg.content.toString();
      const event: InfrastructureEvent = JSON.parse(content);
      const routingKey = msg.fields.routingKey;

      this.logger.log(`📥 Infrastructure event received: ${event.eventName} [${routingKey}]`);

      // Traiter selon le routing key ou le nom de l'événement
      switch (event.eventName) {
        case 'batiment.created':
          await this.onBatimentCreated(event);
          break;

        case 'batiment.updated':
          await this.onBatimentUpdated(event);
          break;

        case 'espace.created':
          await this.onEspaceCreated(event);
          break;

        case 'espace.updated':
          await this.onEspaceUpdated(event);
          break;

        case 'espace.deleted':
          await this.onEspaceDeleted(event);
          break;

        case 'equipement.status.changed':
        case 'equipement.status.changed.infra':
          await this.onEquipementStatusChangedInfra(event);
          break;

        case 'equipement.assigned.to.espace':
          await this.onEquipementAssignedToEspace(event);
          break;

        case 'equipement.removed.from.espace':
          await this.onEquipementRemovedFromEspace(event);
          break;

        default:
          this.logger.debug(`Unhandled infrastructure event: ${event.eventName}`);
      }

      this.channel.ack(msg);
    } catch (error) {
      this.logger.error('Error handling infrastructure event', error);
      this.channel.nack(msg, false, false);
    }
  }

  // ============================================
  // Handlers pour événements User
  // ============================================

  private async onUserCreated(event: InfrastructureEvent) {
    this.logger.log(`👤 New user created: ${event.payload.email || event.aggregateId}`);
    // Émettre un événement interne pour que d'autres services puissent réagir
    this.eventEmitter.emit('user.created', {
      userId: event.aggregateId,
      ...event.payload,
    });
  }

  private async onUserUpdated(event: InfrastructureEvent) {
    this.logger.log(`📝 User updated: ${event.aggregateId}`);
    // Si l'utilisateur change de service, on peut vouloir mettre à jour ses affectations
    this.eventEmitter.emit('user.updated', {
      userId: event.aggregateId,
      ...event.payload,
    });
  }

  private async onUserDeleted(event: InfrastructureEvent) {
    this.logger.warn(`🗑️ User deleted: ${event.aggregateId}`);
    // Émettre un événement pour gérer les équipements encore affectés
    this.eventEmitter.emit('user.deleted', {
      userId: event.aggregateId,
      ...event.payload,
    });
  }

  // ============================================
  // Handlers pour événements Infrastructure - Bâtiment
  // ============================================

  private async onBatimentCreated(event: InfrastructureEvent) {
    this.logger.log(`🏢 New building created: ${event.payload.nom || event.aggregateId}`);
    this.eventEmitter.emit('infrastructure.batiment.created', {
      batimentId: event.aggregateId,
      nom: event.payload.nom,
      type: event.payload.type,
      adresse: event.payload.adresse,
    });
  }

  private async onBatimentUpdated(event: InfrastructureEvent) {
    this.logger.log(`📝 Building updated: ${event.aggregateId}`);
    this.eventEmitter.emit('infrastructure.batiment.updated', {
      batimentId: event.aggregateId,
      ...event.payload,
    });
  }

  // ============================================
  // Handlers pour événements Infrastructure - Espace
  // ============================================

  private async onEspaceCreated(event: InfrastructureEvent) {
    this.logger.log(`🏠 New space created: ${event.payload.numero || event.aggregateId}`);
    // Synchroniser les espaces disponibles pour le stockage d'équipements
    this.eventEmitter.emit('infrastructure.espace.created', {
      espaceId: event.aggregateId,
      numero: event.payload.numero,
      type: event.payload.type,
      etageId: event.payload.etageId,
      batimentId: event.payload.batimentId,
      nomBatiment: event.payload.nomBatiment,
      capacite: event.payload.capacite,
    });
  }

  private async onEspaceUpdated(event: InfrastructureEvent) {
    this.logger.log(`📝 Space updated: ${event.aggregateId}`);
    this.eventEmitter.emit('infrastructure.espace.updated', {
      espaceId: event.aggregateId,
      ...event.payload,
    });
  }

  private async onEspaceDeleted(event: InfrastructureEvent) {
    this.logger.warn(`🗑️ Space deleted: ${event.aggregateId}`);
    // Important: Gérer les équipements qui étaient dans cet espace
    this.eventEmitter.emit('infrastructure.espace.deleted', {
      espaceId: event.aggregateId,
      ...event.payload,
    });
  }

  // ============================================
  // Handlers pour événements Infrastructure - Équipement
  // ============================================

  /**
   * Quand infrastructure-service signale un changement de statut d'équipement
   * (par ex: un équipement marqué défectueux dans l'espace)
   */
  private async onEquipementStatusChangedInfra(event: InfrastructureEvent) {
    this.logger.log(
      `🔄 Equipment status changed in infrastructure: ${event.aggregateId} - ` +
      `${event.payload.ancienStatut} -> ${event.payload.nouveauStatut}`,
    );

    this.eventEmitter.emit('infrastructure.equipement.status.changed', {
      equipementId: event.aggregateId,
      ancienStatut: event.payload.ancienStatut,
      nouveauStatut: event.payload.nouveauStatut,
      espaceId: event.payload.espaceId,
      motif: event.payload.motif,
      // Flags utiles
      devientDefectueux: event.payload.devientDefectueux,
      devientFonctionnel: event.payload.devientFonctionnel,
    });
  }

  /**
   * Quand un équipement est assigné à un espace via infrastructure-service
   */
  private async onEquipementAssignedToEspace(event: InfrastructureEvent) {
    this.logger.log(
      `📍 Equipment assigned to space via infrastructure: ${event.aggregateId} -> ${event.payload.espaceId}`,
    );

    this.eventEmitter.emit('infrastructure.equipement.assigned', {
      equipementId: event.aggregateId,
      espaceId: event.payload.espaceId,
      batimentId: event.payload.batimentId,
      etageId: event.payload.etageId,
      nomEspace: event.payload.nomEspace,
      nomBatiment: event.payload.nomBatiment,
    });
  }

  /**
   * Quand un équipement est retiré d'un espace via infrastructure-service
   */
  private async onEquipementRemovedFromEspace(event: InfrastructureEvent) {
    this.logger.log(
      `📤 Equipment removed from space via infrastructure: ${event.aggregateId}`,
    );

    this.eventEmitter.emit('infrastructure.equipement.removed', {
      equipementId: event.aggregateId,
      ancienEspaceId: event.payload.ancienEspaceId,
      motif: event.payload.motif,
    });
  }
}
