// src/domain/enums/type-espace.enum.ts

/**
 * Types d'espaces selon le cahier des charges IUSJC
 * Categorise les differents locaux geres par le systeme
 */
export enum TypeEspace {
    /** Chambre individuelle (1 occupant) */
    CHAMBRE_SIMPLE = 'CHAMBRE_SIMPLE',
    
    /** Chambre double (2 occupants) */
    CHAMBRE_DOUBLE = 'CHAMBRE_DOUBLE',
    
    /** Chambre triple ou plus */
    CHAMBRE_TRIPLE = 'CHAMBRE_TRIPLE',
    
    /** Salle de cours standard */
    SALLE_CLASSE = 'SALLE_CLASSE',
    
    /** Grand amphitheatre */
    AMPHITHEATRE = 'AMPHITHEATRE',
    
    /** Bureau individuel */
    BUREAU_INDIVIDUEL = 'BUREAU_INDIVIDUEL',
    
    /** Bureau partage (open space) */
    BUREAU_PARTAGE = 'BUREAU_PARTAGE',
    
    /** Laboratoire technique ou scientifique */
    LABORATOIRE = 'LABORATOIRE',
    
    /** Salle de reunion */
    SALLE_REUNION = 'SALLE_REUNION',
    
    /** Sanitaires communs */
    SANITAIRES = 'SANITAIRES',
    
    /** Cuisine commune */
    CUISINE = 'CUISINE',
    
    /** Autre type d'espace */
    AUTRE = 'AUTRE',
}

/**
 * Labels francais pour l'affichage
 */
export const TypeEspaceLabels: Record<TypeEspace, string> = {
    [TypeEspace.CHAMBRE_SIMPLE]: 'Chambre Simple',
    [TypeEspace.CHAMBRE_DOUBLE]: 'Chambre Double',
    [TypeEspace.CHAMBRE_TRIPLE]: 'Chambre Triple',
    [TypeEspace.SALLE_CLASSE]: 'Salle de Classe',
    [TypeEspace.AMPHITHEATRE]: 'Amphithéâtre',
    [TypeEspace.BUREAU_INDIVIDUEL]: 'Bureau Individuel',
    [TypeEspace.BUREAU_PARTAGE]: 'Bureau Partagé',
    [TypeEspace.LABORATOIRE]: 'Laboratoire',
    [TypeEspace.SALLE_REUNION]: 'Salle de Réunion',
    [TypeEspace.SANITAIRES]: 'Sanitaires',
    [TypeEspace.CUISINE]: 'Cuisine',
    [TypeEspace.AUTRE]: 'Autre',
};

/**
 * Types d'espaces considerés comme des chambres (pour assignation occupants)
 */
export const TYPES_CHAMBRES: TypeEspace[] = [
    TypeEspace.CHAMBRE_SIMPLE,
    TypeEspace.CHAMBRE_DOUBLE,
    TypeEspace.CHAMBRE_TRIPLE,
];

/**
 * Verifie si un type d'espace est une chambre
 */
export function estUneChambre(type: TypeEspace): boolean {
    return TYPES_CHAMBRES.includes(type);
}