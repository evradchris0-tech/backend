/**
 * Statut de l'équipement dans le système
 */
export enum StatutEquipement {
  /** En stock - Disponible dans l'entrepôt */
  EN_STOCK = 'EN_STOCK',

  /** Affecté - Attribué à un service ou utilisateur */
  AFFECTE = 'AFFECTE',

  /** En maintenance - En cours de réparation */
  EN_MAINTENANCE = 'EN_MAINTENANCE',

  /** Réservé - Réservé pour une affectation future */
  RESERVE = 'RESERVE',

  /** Épuisé - Stock à zéro */
  EPUISE = 'EPUISE',

  /** Obsolète - Ne sera plus utilisé */
  OBSOLETE = 'OBSOLETE',

  /** Hors service - Endommagé de manière irréversible */
  HORS_SERVICE = 'HORS_SERVICE',
}
