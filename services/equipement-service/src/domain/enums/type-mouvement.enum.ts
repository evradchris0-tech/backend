/**
 * Type de mouvement de stock
 * Basé sur les documents d'enregistrement du stock matériel
 */
export enum TypeMouvement {
  /** Entrée par achat auprès d'un fournisseur */
  ENTREE_ACHAT = 'ENTREE_ACHAT',

  /** Entrée par don ou transfert externe */
  ENTREE_DON = 'ENTREE_DON',

  /** Entrée par retour d'affectation */
  ENTREE_RETOUR = 'ENTREE_RETOUR',

  /** Sortie pour affectation à un service/utilisateur */
  SORTIE_AFFECTATION = 'SORTIE_AFFECTATION',

  /** Sortie par consommation (consommables) */
  SORTIE_CONSOMMATION = 'SORTIE_CONSOMMATION',

  /** Sortie par perte */
  SORTIE_PERTE = 'SORTIE_PERTE',

  /** Sortie par casse ou destruction */
  SORTIE_CASSE = 'SORTIE_CASSE',

  /** Transfert entre espaces de stockage */
  TRANSFERT = 'TRANSFERT',

  /** Correction après inventaire */
  INVENTAIRE_CORRECTION = 'INVENTAIRE_CORRECTION',
}
