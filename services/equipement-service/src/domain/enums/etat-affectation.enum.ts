/**
 * État d'une affectation d'équipement
 */
export enum EtatAffectation {
  /** Affectation en cours */
  ACTIVE = 'ACTIVE',

  /** Équipement retourné en bon état */
  RETOURNEE = 'RETOURNEE',

  /** Équipement perdu */
  PERDUE = 'PERDUE',

  /** Équipement endommagé */
  ENDOMMAGEE = 'ENDOMMAGEE',
}
