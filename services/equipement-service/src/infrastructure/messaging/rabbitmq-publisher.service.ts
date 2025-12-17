import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import {
  RABBITMQ_EXCHANGES,
  RABBITMQ_QUEUES,
  QUEUE_BINDINGS,
  MESSAGE_PATTERNS,
} from '../config/rabbitmq-exchanges.config';

/**
 * Service pour publier des messages RabbitMQ
 * Utilise amqplib directement pour un contrôle total des exchanges et queues
 */
@Injectable()
export class RabbitMQPublisherService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQPublisherService.name);
  private connection: amqp.Connection;
  private channel: amqp.Channel;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    try {
      const rabbitmqUrl = this.configService.get<string>(
        'RABBITMQ_URL',
        'amqp://guest:guest@localhost:5672',
      );

      // Connexion RabbitMQ
      this.connection = await amqp.connect(rabbitmqUrl);
      this.channel = await this.connection.createChannel();

      // Setup exchanges, queues et bindings
      await this.setupInfrastructure();

      this.logger.log('✅ RabbitMQ Publisher connected and infrastructure setup complete');
    } catch (error) {
      this.logger.error('❌ Failed to connect to RabbitMQ', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.channel?.close();
      await this.connection?.close();
      this.logger.log('RabbitMQ Publisher disconnected');
    } catch (error) {
      this.logger.error('Error closing RabbitMQ connection', error);
    }
  }

  /**
   * Setup exchanges, queues et bindings
   */
  private async setupInfrastructure(): Promise<void> {
    // 1. Créer les exchanges
    for (const exchange of Object.values(RABBITMQ_EXCHANGES)) {
      await this.channel.assertExchange(exchange, 'topic', {
        durable: true,
      });
      this.logger.debug(`Exchange created: ${exchange}`);
    }

    // 2. Créer les queues
    for (const queue of Object.values(RABBITMQ_QUEUES)) {
      await this.channel.assertQueue(queue, {
        durable: true,
      });
      this.logger.debug(`Queue created: ${queue}`);
    }

    // 3. Créer les bindings
    for (const binding of QUEUE_BINDINGS) {
      for (const routingKey of binding.routingKeys) {
        await this.channel.bindQueue(
          binding.queue,
          binding.exchange,
          routingKey,
        );
        this.logger.debug(
          `Binding created: ${binding.queue} <- ${binding.exchange} [${routingKey}]`,
        );
      }
    }
  }

  /**
   * Publie un événement de domaine
   */
  async publishDomainEvent(
    routingKey: string,
    event: any,
    exchange: string = RABBITMQ_EXCHANGES.EQUIPEMENT_EVENTS,
  ): Promise<void> {
    try {
      const message = JSON.stringify({
        eventName: event.eventName,
        occurredOn: event.occurredOn,
        aggregateId: event.aggregateId,
        payload: event.payload,
        metadata: {
          service: 'equipement-service',
          timestamp: new Date().toISOString(),
        },
      });

      this.channel.publish(
        exchange,
        routingKey,
        Buffer.from(message),
        {
          persistent: true,
          contentType: 'application/json',
          timestamp: Date.now(),
        },
      );

      this.logger.debug(
        `📤 Event published: [${exchange}] ${routingKey}`,
        event.eventName,
      );
    } catch (error) {
      this.logger.error(`Failed to publish event: ${routingKey}`, error);
      throw error;
    }
  }

  /**
   * Envoie un message direct à une queue
   */
  async sendToQueue(queue: string, message: any): Promise<void> {
    try {
      const content = JSON.stringify(message);

      this.channel.sendToQueue(
        queue,
        Buffer.from(content),
        {
          persistent: true,
          contentType: 'application/json',
        },
      );

      this.logger.debug(`Message sent to queue: ${queue}`);
    } catch (error) {
      this.logger.error(`Failed to send message to queue: ${queue}`, error);
      throw error;
    }
  }

  /**
   * Récupère le channel (pour utilisation avancée)
   */
  getChannel(): amqp.Channel {
    return this.channel;
  }

  // ============================================
  // Méthodes de publication vers infrastructure-service
  // ============================================

  /**
   * Notifie infrastructure-service quand un équipement est affecté à un espace
   * Permet de créer/lier l'équipement dans l'espace correspondant
   */
  async publishEquipementAffecteVersEspace(data: {
    equipementId: string;
    reference: string;
    designation: string;
    typeEquipement: string;
    espaceId: string;
    quantite: number;
    affectationId: string;
    serviceBeneficiaire?: string;
    utilisateurBeneficiaire?: string;
    dateAffectation: Date;
    dateRetourPrevu?: Date;
  }): Promise<void> {
    const message = {
      eventName: MESSAGE_PATTERNS.EQUIPEMENT_AFFECTE_VERS_ESPACE,
      occurredOn: new Date(),
      aggregateId: data.equipementId,
      payload: {
        ...data,
        dateAffectation: data.dateAffectation.toISOString(),
        dateRetourPrevu: data.dateRetourPrevu?.toISOString(),
      },
      metadata: {
        service: 'equipement-service',
        timestamp: new Date().toISOString(),
      },
    };

    await this.sendToQueue(RABBITMQ_QUEUES.INFRASTRUCTURE_QUEUE, message);
    this.logger.log(
      `📤 Événement EQUIPEMENT_AFFECTE_VERS_ESPACE envoyé - Equipement: ${data.equipementId}, Espace: ${data.espaceId}`,
    );
  }

  /**
   * Notifie infrastructure-service quand un équipement est retourné d'un espace
   */
  async publishEquipementRetourneDuEspace(data: {
    equipementId: string;
    reference: string;
    espaceId: string;
    affectationId: string;
    quantite: number;
    etat: string; // RETOURNEE, PERDUE, ENDOMMAGEE
    dateRetour: Date;
    motif?: string;
  }): Promise<void> {
    const message = {
      eventName: MESSAGE_PATTERNS.EQUIPEMENT_RETOURNE_DU_ESPACE,
      occurredOn: new Date(),
      aggregateId: data.equipementId,
      payload: {
        ...data,
        dateRetour: data.dateRetour.toISOString(),
      },
      metadata: {
        service: 'equipement-service',
        timestamp: new Date().toISOString(),
      },
    };

    await this.sendToQueue(RABBITMQ_QUEUES.INFRASTRUCTURE_QUEUE, message);
    this.logger.log(
      `📤 Événement EQUIPEMENT_RETOURNE_DU_ESPACE envoyé - Equipement: ${data.equipementId}, État: ${data.etat}`,
    );
  }

  /**
   * Notifie infrastructure-service d'une panne enregistrée sur un équipement
   * Permet de mettre à jour le statut dans l'espace si l'équipement y est installé
   */
  async publishPanneEnregistree(data: {
    equipementId: string;
    reference: string;
    designation: string;
    espaceId?: string;
    description: string;
    datePanne: Date;
    nombrePannesTotal: number;
  }): Promise<void> {
    const message = {
      eventName: MESSAGE_PATTERNS.EQUIPEMENT_PANNE,
      occurredOn: new Date(),
      aggregateId: data.equipementId,
      payload: {
        ...data,
        datePanne: data.datePanne.toISOString(),
      },
      metadata: {
        service: 'equipement-service',
        timestamp: new Date().toISOString(),
      },
    };

    await this.sendToQueue(RABBITMQ_QUEUES.INFRASTRUCTURE_QUEUE, message);
    this.logger.log(
      `📤 Événement PANNE_ENREGISTREE envoyé - Equipement: ${data.equipementId}`,
    );
  }

  /**
   * Notifie infrastructure-service qu'une maintenance est terminée
   */
  async publishMaintenanceTerminee(data: {
    equipementId: string;
    reference: string;
    espaceId?: string;
    dateFinMaintenance: Date;
    resultat: 'REPARE' | 'NON_REPARABLE' | 'A_REMPLACER';
    description?: string;
  }): Promise<void> {
    const message = {
      eventName: MESSAGE_PATTERNS.EQUIPEMENT_MAINTENANCE_FIN,
      occurredOn: new Date(),
      aggregateId: data.equipementId,
      payload: {
        ...data,
        dateFinMaintenance: data.dateFinMaintenance.toISOString(),
      },
      metadata: {
        service: 'equipement-service',
        timestamp: new Date().toISOString(),
      },
    };

    await this.sendToQueue(RABBITMQ_QUEUES.INFRASTRUCTURE_QUEUE, message);
    this.logger.log(
      `📤 Événement MAINTENANCE_TERMINEE envoyé - Equipement: ${data.equipementId}, Résultat: ${data.resultat}`,
    );
  }

  /**
   * Notifie infrastructure-service d'un stock faible
   * Utile pour alerter sur les équipements nécessaires à la maintenance des espaces
   */
  async publishStockFaibleAlerte(data: {
    equipementId: string;
    reference: string;
    designation: string;
    typeEquipement: string;
    categorieId?: string;
    quantiteActuelle: number;
    quantiteMinimale: number;
    seuilCritique: boolean;
  }): Promise<void> {
    const message = {
      eventName: MESSAGE_PATTERNS.STOCK_FAIBLE_ALERTE,
      occurredOn: new Date(),
      aggregateId: data.equipementId,
      payload: data,
      metadata: {
        service: 'equipement-service',
        timestamp: new Date().toISOString(),
      },
    };

    await this.sendToQueue(RABBITMQ_QUEUES.INFRASTRUCTURE_QUEUE, message);
    this.logger.log(
      `📤 Alerte STOCK_FAIBLE envoyée - ${data.designation}: ${data.quantiteActuelle}/${data.quantiteMinimale}`,
    );
  }
}
