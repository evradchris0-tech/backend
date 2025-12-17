import { DomainEvent } from './domain-event.interface';

/**
 * Événement: Stock faible détecté
 */
export class StockFaibleEvent extends DomainEvent {
  constructor(
    equipementId: string,
    payload: {
      designation: string;
      reference: string;
      quantiteActuelle: number;
      quantiteMinimale: number;
      categorieId: string;
    },
  ) {
    super('equipement.stock.faible', equipementId, payload);
  }
}

/**
 * Événement: Stock critique (épuisé ou quasi épuisé)
 */
export class StockCritiqueEvent extends DomainEvent {
  constructor(
    equipementId: string,
    payload: {
      designation: string;
      reference: string;
      quantiteActuelle: number;
      categorieId: string;
    },
  ) {
    super('equipement.stock.critique', equipementId, payload);
  }
}

/**
 * Événement: Stock épuisé
 */
export class StockEpuiseEvent extends DomainEvent {
  constructor(
    equipementId: string,
    payload: {
      designation: string;
      reference: string;
      categorieId: string;
    },
  ) {
    super('equipement.stock.epuise', equipementId, payload);
  }
}

/**
 * Événement: Stock réapprovisionné
 */
export class StockReapprovisionneEvent extends DomainEvent {
  constructor(
    equipementId: string,
    payload: {
      designation: string;
      reference: string;
      quantiteAvant: number;
      quantiteApres: number;
      quantiteAjoutee: number;
    },
  ) {
    super('equipement.stock.reapprovisionne', equipementId, payload);
  }
}
