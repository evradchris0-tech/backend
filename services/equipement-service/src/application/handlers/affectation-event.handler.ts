import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  EquipementAffecteEvent,
  EquipementRetourneEvent,
  AffectationEnRetardEvent,
  EquipementPerduEvent,
  EquipementEndommageEvent,
} from '../../domain/events';
import { RabbitMQPublisherService } from '../../infrastructure/messaging';
import { RABBITMQ_ROUTING_KEYS } from '../../infrastructure/config/rabbitmq-exchanges.config';

/**
 * Handler pour les événements liés aux affectations
 */
@Injectable()
export class AffectationEventHandler {
  private readonly logger = new Logger(AffectationEventHandler.name);

  constructor(
    private readonly rabbitMQPublisher: RabbitMQPublisherService,
  ) {}

  @OnEvent('equipement.affecte')
  async handleEquipementAffecte(event: EquipementAffecteEvent) {
    this.logger.log(
      `📦 Équipement affecté - ${event.payload.designation} à ${event.payload.utilisateurBeneficiaire} (${event.payload.serviceBeneficiaire})`,
    );

    await this.rabbitMQPublisher.publishDomainEvent(
      RABBITMQ_ROUTING_KEYS.AFFECTATION_CREATED,
      event,
    );
  }

  @OnEvent('equipement.retourne')
  async handleEquipementRetourne(event: EquipementRetourneEvent) {
    this.logger.log(
      `🔙 Équipement retourné - ${event.payload.designation} par ${event.payload.utilisateurBeneficiaire} (État: ${event.payload.etat})`,
    );

    await this.rabbitMQPublisher.publishDomainEvent(
      RABBITMQ_ROUTING_KEYS.AFFECTATION_RETOUR,
      event,
    );
  }

  @OnEvent('affectation.retard')
  async handleAffectationEnRetard(event: AffectationEnRetardEvent) {
    this.logger.warn(
      `⏰ Affectation en retard - ${event.payload.designation} (${event.payload.utilisateurBeneficiaire}) - ${event.payload.joursRetard} jours`,
    );

    await this.rabbitMQPublisher.publishDomainEvent(
      RABBITMQ_ROUTING_KEYS.AFFECTATION_RETARD,
      event,
    );
  }

  @OnEvent('equipement.perdu')
  async handleEquipementPerdu(event: EquipementPerduEvent) {
    this.logger.error(
      `❌ Équipement perdu - ${event.payload.designation} (Valeur: ${event.payload.valeurTotale} FCFA)`,
    );

    await this.rabbitMQPublisher.publishDomainEvent(
      RABBITMQ_ROUTING_KEYS.EQUIPEMENT_PERDU,
      event,
    );
  }

  @OnEvent('equipement.endommage')
  async handleEquipementEndommage(event: EquipementEndommageEvent) {
    this.logger.warn(
      `⚠️ Équipement endommagé - ${event.payload.designation} par ${event.payload.utilisateurBeneficiaire}`,
    );

    await this.rabbitMQPublisher.publishDomainEvent(
      RABBITMQ_ROUTING_KEYS.EQUIPEMENT_ENDOMMAGE,
      event,
    );
  }
}
