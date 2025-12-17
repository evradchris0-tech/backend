// src/domain/enums/statut-equipement.enum.ts

/**
 * Statuts possibles pour un equipement selon le cahier des charges
 * Represente le cycle de vie d'un equipement dans le systeme de maintenance
 */
export enum StatutEquipement {
    /** Equipement fonctionnel sans probleme */
    BON_ETAT = 'BON_ETAT',
    
    /** Equipement defectueux mais reparable */
    A_REPARER = 'A_REPARER',
    
    /** Equipement irreparable necessitant remplacement */
    A_REMPLACER = 'A_REMPLACER',
    
    /** Equipement en cours de reparation */
    EN_MAINTENANCE = 'EN_MAINTENANCE',
    
    /** Equipement definitivement hors service (archive) */
    HORS_SERVICE = 'HORS_SERVICE',
    
    /** Reparation suspendue en attente de piece detachee */
    EN_ATTENTE_PIECE = 'EN_ATTENTE_PIECE',
}

/**
 * Labels francais pour l'affichage
 */
export const StatutEquipementLabels: Record<StatutEquipement, string> = {
    [StatutEquipement.BON_ETAT]: 'Bon État',
    [StatutEquipement.A_REPARER]: 'À Réparer',
    [StatutEquipement.A_REMPLACER]: 'À Remplacer',
    [StatutEquipement.EN_MAINTENANCE]: 'En Maintenance',
    [StatutEquipement.HORS_SERVICE]: 'Hors Service',
    [StatutEquipement.EN_ATTENTE_PIECE]: 'En Attente de Pièce',
};

/**
 * Couleurs pour l'interface utilisateur (codes hexadecimaux)
 */
export const StatutEquipementColors: Record<StatutEquipement, string> = {
    [StatutEquipement.BON_ETAT]: '#10B981',        // Vert
    [StatutEquipement.A_REPARER]: '#F59E0B',       // Orange
    [StatutEquipement.A_REMPLACER]: '#EF4444',     // Rouge
    [StatutEquipement.EN_MAINTENANCE]: '#3B82F6',  // Bleu
    [StatutEquipement.HORS_SERVICE]: '#6B7280',    // Gris
    [StatutEquipement.EN_ATTENTE_PIECE]: '#8B5CF6', // Violet
};

/**
 * Statuts considerés comme defectueux (declenchent l'etiquetage de l'espace)
 */
export const STATUTS_DEFECTUEUX: StatutEquipement[] = [
    StatutEquipement.A_REPARER,
    StatutEquipement.A_REMPLACER,
    StatutEquipement.EN_MAINTENANCE,
    StatutEquipement.EN_ATTENTE_PIECE,
];

/**
 * Statuts considerés comme critiques (priorite haute)
 */
export const STATUTS_CRITIQUES: StatutEquipement[] = [
    StatutEquipement.A_REMPLACER,
    StatutEquipement.HORS_SERVICE,
];

/**
 * Matrice des transitions valides entre statuts
 * Cle: statut actuel, Valeur: statuts cibles autorises
 */
export const TRANSITIONS_VALIDES: Record<StatutEquipement, StatutEquipement[]> = {
    [StatutEquipement.BON_ETAT]: [
        StatutEquipement.A_REPARER,
        StatutEquipement.A_REMPLACER,
        StatutEquipement.EN_MAINTENANCE,
    ],
    [StatutEquipement.A_REPARER]: [
        StatutEquipement.BON_ETAT,
        StatutEquipement.A_REMPLACER,
        StatutEquipement.EN_MAINTENANCE,
        StatutEquipement.EN_ATTENTE_PIECE,
    ],
    [StatutEquipement.A_REMPLACER]: [
        StatutEquipement.BON_ETAT,  // Apres remplacement effectif
        StatutEquipement.HORS_SERVICE,
    ],
    [StatutEquipement.EN_MAINTENANCE]: [
        StatutEquipement.BON_ETAT,
        StatutEquipement.A_REPARER,
        StatutEquipement.A_REMPLACER,
        StatutEquipement.EN_ATTENTE_PIECE,
    ],
    [StatutEquipement.HORS_SERVICE]: [], // Statut terminal
    [StatutEquipement.EN_ATTENTE_PIECE]: [
        StatutEquipement.EN_MAINTENANCE,
        StatutEquipement.A_REMPLACER,
    ],
};

/**
 * Verifie si une transition de statut est valide
 */
export function estTransitionValide(
    statutActuel: StatutEquipement,
    nouveauStatut: StatutEquipement,
): boolean {
    if (statutActuel === nouveauStatut) {
        return true; // Pas de changement
    }
    return TRANSITIONS_VALIDES[statutActuel]?.includes(nouveauStatut) ?? false;
}

/**
 * Verifie si un statut est considere comme defectueux
 */
export function estStatutDefectueux(statut: StatutEquipement): boolean {
    return STATUTS_DEFECTUEUX.includes(statut);
}

/**
 * Verifie si un statut est considere comme critique
 */
export function estStatutCritique(statut: StatutEquipement): boolean {
    return STATUTS_CRITIQUES.includes(statut);
}