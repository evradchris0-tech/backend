import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  StockFaibleEvent,
  StockCritiqueEvent,
  StockEpuiseEvent,
  StockReapprovisionneEvent,
} from '../../domain/events';
import { RabbitMQPublisherService } from '../../infrastructure/messaging';
import { RABBITMQ_ROUTING_KEYS } from '../../infrastructure/config/rabbitmq-exchanges.config';

/**
 * Handler pour les événements d'alerte de stock
 * Publie les événements sur RabbitMQ pour notification et traçabilité
 */
@Injectable()
export class StockAlerteHandler {
  private readonly logger = new Logger(StockAlerteHandler.name);

  constructor(
    private readonly rabbitMQPublisher: RabbitMQPublisherService,
  ) {}

  @OnEvent('equipement.stock.faible')
  async handleStockFaible(event: StockFaibleEvent) {
    this.logger.warn(
      `⚠️ STOCK FAIBLE - ${event.payload.designation} (Réf: ${event.payload.reference}) - ` +
        `Stock: ${event.payload.quantiteActuelle}/${event.payload.quantiteMinimale}`,
    );

    // Publier sur RabbitMQ pour notification-service
    await this.rabbitMQPublisher.publishDomainEvent(
      RABBITMQ_ROUTING_KEYS.STOCK_FAIBLE,
      event,
    );
  }

  @OnEvent('equipement.stock.critique')
  async handleStockCritique(event: StockCritiqueEvent) {
    this.logger.error(
      `🔴 STOCK CRITIQUE - ${event.payload.designation} (Réf: ${event.payload.reference}) - ` +
        `Stock: ${event.payload.quantiteActuelle} unités`,
    );

    // Publier sur RabbitMQ - Priorité HAUTE
    await this.rabbitMQPublisher.publishDomainEvent(
      RABBITMQ_ROUTING_KEYS.STOCK_CRITIQUE,
      event,
    );
  }

  @OnEvent('equipement.stock.epuise')
  async handleStockEpuise(event: StockEpuiseEvent) {
    this.logger.error(
      `❌ STOCK ÉPUISÉ - ${event.payload.designation} (Réf: ${event.payload.reference})`,
    );

    // Publier sur RabbitMQ - Priorité CRITIQUE
    await this.rabbitMQPublisher.publishDomainEvent(
      RABBITMQ_ROUTING_KEYS.STOCK_EPUISE,
      event,
    );
  }

  @OnEvent('equipement.stock.reapprovisionne')
  async handleStockReapprovisionne(event: StockReapprovisionneEvent) {
    this.logger.log(
      `✅ STOCK RÉAPPROVISIONNÉ - ${event.payload.designation} (Réf: ${event.payload.reference}) - ` +
        `${event.payload.quantiteAvant} → ${event.payload.quantiteApres} (+${event.payload.quantiteAjoutee})`,
    );

    // Publier sur RabbitMQ
    await this.rabbitMQPublisher.publishDomainEvent(
      RABBITMQ_ROUTING_KEYS.STOCK_REAPPROVISIONNE,
      event,
    );
  }
}
