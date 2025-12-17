import { DomainEvent } from './domain-event.interface';

/**
 * Événement: Nouvel équipement créé
 */
export class EquipementCreeEvent extends DomainEvent {
  constructor(
    equipementId: string,
    payload: {
      designation: string;
      reference: string;
      typeEquipement: string;
      categorieId: string;
      quantiteStock: number;
      valeurUnitaire: number;
    },
  ) {
    super('equipement.cree', equipementId, payload);
  }
}

/**
 * Événement: Équipement mis à jour
 */
export class EquipementMisAJourEvent extends DomainEvent {
  constructor(
    equipementId: string,
    payload: {
      designation: string;
      reference: string;
      champsModifies: string[];
    },
  ) {
    super('equipement.mis_a_jour', equipementId, payload);
  }
}

/**
 * Événement: Équipement marqué hors service
 */
export class EquipementHorsServiceEvent extends DomainEvent {
  constructor(
    equipementId: string,
    payload: {
      designation: string;
      reference: string;
      motif?: string;
    },
  ) {
    super('equipement.hors_service', equipementId, payload);
  }
}

/**
 * Événement: Équipement marqué obsolète
 */
export class EquipementObsoleteEvent extends DomainEvent {
  constructor(
    equipementId: string,
    payload: {
      designation: string;
      reference: string;
      motif?: string;
    },
  ) {
    super('equipement.obsolete', equipementId, payload);
  }
}
