import { DomainEvent } from './domain-event.interface';

/**
 * Événement: Équipement affecté
 */
export class EquipementAffecteEvent extends DomainEvent {
  constructor(
    equipementId: string,
    payload: {
      affectationId: string;
      designation: string;
      reference: string;
      quantite: number;
      serviceBeneficiaire: string;
      utilisateurBeneficiaire: string;
      dateAffectation: Date;
      dateRetourPrevu?: Date;
    },
  ) {
    super('equipement.affecte', equipementId, payload);
  }
}

/**
 * Événement: Équipement retourné
 */
export class EquipementRetourneEvent extends DomainEvent {
  constructor(
    equipementId: string,
    payload: {
      affectationId: string;
      designation: string;
      reference: string;
      quantite: number;
      serviceBeneficiaire: string;
      utilisateurBeneficiaire: string;
      dateRetour: Date;
      etat: string;
      estEnRetard: boolean;
    },
  ) {
    super('equipement.retourne', equipementId, payload);
  }
}

/**
 * Événement: Affectation en retard
 */
export class AffectationEnRetardEvent extends DomainEvent {
  constructor(
    affectationId: string,
    payload: {
      equipementId: string;
      designation: string;
      reference: string;
      utilisateurBeneficiaire: string;
      serviceBeneficiaire: string;
      dateRetourPrevu: Date;
      joursRetard: number;
    },
  ) {
    super('affectation.retard', affectationId, payload);
  }
}

/**
 * Événement: Équipement perdu
 */
export class EquipementPerduEvent extends DomainEvent {
  constructor(
    equipementId: string,
    payload: {
      affectationId: string;
      designation: string;
      reference: string;
      quantite: number;
      utilisateurBeneficiaire: string;
      serviceBeneficiaire: string;
      valeurUnitaire: number;
      valeurTotale: number;
    },
  ) {
    super('equipement.perdu', equipementId, payload);
  }
}

/**
 * Événement: Équipement endommagé lors du retour
 */
export class EquipementEndommageEvent extends DomainEvent {
  constructor(
    equipementId: string,
    payload: {
      affectationId: string;
      designation: string;
      reference: string;
      quantite: number;
      utilisateurBeneficiaire: string;
      serviceBeneficiaire: string;
      motif?: string;
    },
  ) {
    super('equipement.endommage', equipementId, payload);
  }
}
