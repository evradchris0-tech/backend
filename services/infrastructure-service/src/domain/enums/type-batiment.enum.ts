// src/domain/enums/type-batiment.enum.ts

/**
 * Types de batiments selon le cahier des charges IUSJC
 * Permet de categoriser les batiments par usage principal
 */
export enum TypeBatiment {
    /** Batiment contenant salles de classe, amphitheatres */
    PEDAGOGIQUE = 'PEDAGOGIQUE',
    
    /** Batiment des bureaux administratifs */
    ADMINISTRATIF = 'ADMINISTRATIF',
    
    /** Batiment de residence etudiante (Cite U) */
    CITE_UNIVERSITAIRE = 'CITE_UNIVERSITAIRE',
    
    /** Batiment des peres ou autre personnel resident */
    RESIDENCE_PERSONNEL = 'RESIDENCE_PERSONNEL',
    
    /** Batiment a usage multiple */
    MIXTE = 'MIXTE',
}

/**
 * Labels francais pour l'affichage
 */
export const TypeBatimentLabels: Record<TypeBatiment, string> = {
    [TypeBatiment.PEDAGOGIQUE]: 'Pédagogique',
    [TypeBatiment.ADMINISTRATIF]: 'Administratif',
    [TypeBatiment.CITE_UNIVERSITAIRE]: 'Cité Universitaire',
    [TypeBatiment.RESIDENCE_PERSONNEL]: 'Résidence Personnel',
    [TypeBatiment.MIXTE]: 'Mixte',
};