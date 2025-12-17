import { DomainEvent } from './domain-event.interface';

/**
 * Événement: Panne enregistrée
 */
export class PanneEnregistreeEvent extends DomainEvent {
  constructor(
    equipementId: string,
    payload: {
      designation: string;
      reference: string;
      historiquePannes: number;
    },
  ) {
    super('equipement.panne', equipementId, payload);
  }
}

/**
 * Événement: Maintenance terminée
 */
export class MaintenanceTermineeEvent extends DomainEvent {
  constructor(
    equipementId: string,
    payload: {
      designation: string;
      reference: string;
    },
  ) {
    super('equipement.maintenance_terminee', equipementId, payload);
  }
}

/**
 * Événement: Maintenance nécessaire (seuil de pannes atteint)
 */
export class MaintenanceNecessaireEvent extends DomainEvent {
  constructor(
    equipementId: string,
    payload: {
      designation: string;
      reference: string;
      historiquePannes: number;
      seuilPannes: number;
    },
  ) {
    super('equipement.maintenance_necessaire', equipementId, payload);
  }
}
