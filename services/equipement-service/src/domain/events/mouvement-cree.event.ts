import { DomainEvent } from './domain-event.interface';

/**
 * Événement: Mouvement de stock créé
 */
export class MouvementCreeEvent extends DomainEvent {
  constructor(
    mouvementId: string,
    payload: {
      equipementId: string;
      designation: string;
      reference: string;
      typeMouvement: string;
      quantite: number;
      quantiteAvant: number;
      quantiteApres: number;
      motif: string;
      utilisateurId: string;
    },
  ) {
    super('mouvement.cree', mouvementId, payload);
  }
}

/**
 * Événement: Entrée de stock (achat, don, retour)
 */
export class EntreeStockEvent extends DomainEvent {
  constructor(
    mouvementId: string,
    payload: {
      equipementId: string;
      designation: string;
      reference: string;
      typeMouvement: string;
      quantite: number;
      fournisseurId?: string;
      facture?: {
        numero: string;
        montant: number;
      };
    },
  ) {
    super('mouvement.entree', mouvementId, payload);
  }
}

/**
 * Événement: Sortie de stock
 */
export class SortieStockEvent extends DomainEvent {
  constructor(
    mouvementId: string,
    payload: {
      equipementId: string;
      designation: string;
      reference: string;
      typeMouvement: string;
      quantite: number;
      serviceDestination?: string;
      motif: string;
    },
  ) {
    super('mouvement.sortie', mouvementId, payload);
  }
}

/**
 * Événement: Transfert entre espaces de stockage
 */
export class TransfertStockEvent extends DomainEvent {
  constructor(
    mouvementId: string,
    payload: {
      equipementId: string;
      designation: string;
      reference: string;
      quantite: number;
      espaceOrigine?: string;
      espaceDestination?: string;
    },
  ) {
    super('mouvement.transfert', mouvementId, payload);
  }
}
