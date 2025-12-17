import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  EquipementCreeEvent,
  EquipementMisAJourEvent,
  EquipementHorsServiceEvent,
  EquipementObsoleteEvent,
  PanneEnregistreeEvent,
  MaintenanceTermineeEvent,
} from '../../domain/events';
import { RabbitMQPublisherService } from '../../infrastructure/messaging';
import { RABBITMQ_ROUTING_KEYS } from '../../infrastructure/config/rabbitmq-exchanges.config';

/**
 * Handler pour les événements liés aux équipements
 */
@Injectable()
export class EquipementEventHandler {
  private readonly logger = new Logger(EquipementEventHandler.name);

  constructor(
    private readonly rabbitMQPublisher: RabbitMQPublisherService,
  ) {}

  @OnEvent('equipement.cree')
  async handleEquipementCree(event: EquipementCreeEvent) {
    this.logger.log(
      `✨ Équipement créé - ${event.payload.designation} (Réf: ${event.payload.reference})`,
    );

    await this.rabbitMQPublisher.publishDomainEvent(
      RABBITMQ_ROUTING_KEYS.EQUIPEMENT_CREATED,
      event,
    );
  }

  @OnEvent('equipement.mis_a_jour')
  async handleEquipementMisAJour(event: EquipementMisAJourEvent) {
    this.logger.log(
      `📝 Équipement mis à jour - ${event.payload.designation}`,
    );

    await this.rabbitMQPublisher.publishDomainEvent(
      RABBITMQ_ROUTING_KEYS.EQUIPEMENT_UPDATED,
      event,
    );
  }

  @OnEvent('equipement.hors_service')
  async handleEquipementHorsService(event: EquipementHorsServiceEvent) {
    this.logger.warn(
      `⚠️ Équipement hors service - ${event.payload.designation}`,
    );

    await this.rabbitMQPublisher.publishDomainEvent(
      RABBITMQ_ROUTING_KEYS.EQUIPEMENT_UPDATED,
      event,
    );
  }

  @OnEvent('equipement.obsolete')
  async handleEquipementObsolete(event: EquipementObsoleteEvent) {
    this.logger.warn(
      `🗑️ Équipement obsolète - ${event.payload.designation}`,
    );

    await this.rabbitMQPublisher.publishDomainEvent(
      RABBITMQ_ROUTING_KEYS.EQUIPEMENT_UPDATED,
      event,
    );
  }

  @OnEvent('equipement.panne')
  async handlePanneEnregistree(event: PanneEnregistreeEvent) {
    this.logger.warn(
      `🔧 Panne enregistrée - ${event.payload.designation} (Total: ${event.payload.historiquePannes})`,
    );

    await this.rabbitMQPublisher.publishDomainEvent(
      RABBITMQ_ROUTING_KEYS.PANNE_ENREGISTREE,
      event,
    );
  }

  @OnEvent('equipement.maintenance_terminee')
  async handleMaintenanceTerminee(event: MaintenanceTermineeEvent) {
    this.logger.log(
      `✅ Maintenance terminée - ${event.payload.designation}`,
    );

    await this.rabbitMQPublisher.publishDomainEvent(
      RABBITMQ_ROUTING_KEYS.MAINTENANCE_TERMINEE,
      event,
    );
  }
}
