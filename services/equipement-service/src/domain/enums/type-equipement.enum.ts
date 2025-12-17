/**
 * Type d'équipement
 * Basé sur le stock matériel du cahier des charges
 */
export enum TypeEquipement {
  /** Mobilier - Tables, chaises, armoires, bureaux */
  MOBILIER = 'MOBILIER',

  /** Électronique - Ordinateurs, imprimantes, téléphones */
  ELECTRONIQUE = 'ELECTRONIQUE',

  /** Informatique - Câbles, claviers, souris, accessoires IT */
  INFORMATIQUE = 'INFORMATIQUE',

  /** Électroménager - Réfrigérateurs, climatiseurs, ventilateurs */
  ELECTROMENAGER = 'ELECTROMENAGER',

  /** Fournitures de bureau - Papier, stylos, agrafeuses */
  FOURNITURE_BUREAU = 'FOURNITURE_BUREAU',

  /** Matériel de nettoyage - Balais, serpillères, seaux */
  MATERIEL_NETTOYAGE = 'MATERIEL_NETTOYAGE',

  /** Consommables - Encre, toner, savon, papier toilette */
  CONSOMMABLE = 'CONSOMMABLE',

  /** Sanitaire - WC, lavabos, douches, robinetterie */
  SANITAIRE = 'SANITAIRE',

  /** Électricité - Prises, câbles électriques, ampoules */
  ELECTRICITE = 'ELECTRICITE',

  /** Autre - Équipements non classifiés */
  AUTRE = 'AUTRE',
}
