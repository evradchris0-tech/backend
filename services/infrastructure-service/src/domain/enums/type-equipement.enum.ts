// src/domain/enums/type-equipement.enum.ts

/**
 * Types d'equipements selon le cahier des charges IUSJC
 * Couvre tous les equipements presents dans les espaces du campus
 */
export enum TypeEquipement {
    // Mobilier de chambre
    LIT = 'LIT',
    TABLE = 'TABLE',
    CHAISE = 'CHAISE',
    ARMOIRE = 'ARMOIRE',
    BUREAU = 'BUREAU',
    ETAGERE = 'ETAGERE',
    
    // Electromenager
    CLIMATISEUR = 'CLIMATISEUR',
    VENTILATEUR = 'VENTILATEUR',
    REFRIGERATEUR = 'REFRIGERATEUR',
    TELEVISEUR = 'TELEVISEUR',
    
    // Sanitaires
    LAVABO = 'LAVABO',
    WC = 'WC',
    DOUCHE = 'DOUCHE',
    CHAUFFE_EAU = 'CHAUFFE_EAU',
    
    // Installations fixes
    PORTE = 'PORTE',
    FENETRE = 'FENETRE',
    PRISE_ELECTRIQUE = 'PRISE_ELECTRIQUE',
    INTERRUPTEUR = 'INTERRUPTEUR',
    LAMPE = 'LAMPE',
    PLAFONNIER = 'PLAFONNIER',
    
    // Equipements pedagogiques
    TABLEAU_BLANC = 'TABLEAU_BLANC',
    TABLEAU_NOIR = 'TABLEAU_NOIR',
    PROJECTEUR = 'PROJECTEUR',
    ECRAN_PROJECTION = 'ECRAN_PROJECTION',
    ORDINATEUR = 'ORDINATEUR',
    
    // Securite
    EXTINCTEUR = 'EXTINCTEUR',
    DETECTEUR_FUMEE = 'DETECTEUR_FUMEE',
    
    // Autre
    AUTRE = 'AUTRE',
}

/**
 * Labels francais pour l'affichage
 */
export const TypeEquipementLabels: Record<TypeEquipement, string> = {
    [TypeEquipement.LIT]: 'Lit',
    [TypeEquipement.TABLE]: 'Table',
    [TypeEquipement.CHAISE]: 'Chaise',
    [TypeEquipement.ARMOIRE]: 'Armoire',
    [TypeEquipement.BUREAU]: 'Bureau',
    [TypeEquipement.ETAGERE]: 'Étagère',
    [TypeEquipement.CLIMATISEUR]: 'Climatiseur',
    [TypeEquipement.VENTILATEUR]: 'Ventilateur',
    [TypeEquipement.REFRIGERATEUR]: 'Réfrigérateur',
    [TypeEquipement.TELEVISEUR]: 'Téléviseur',
    [TypeEquipement.LAVABO]: 'Lavabo',
    [TypeEquipement.WC]: 'WC',
    [TypeEquipement.DOUCHE]: 'Douche',
    [TypeEquipement.CHAUFFE_EAU]: 'Chauffe-eau',
    [TypeEquipement.PORTE]: 'Porte',
    [TypeEquipement.FENETRE]: 'Fenêtre',
    [TypeEquipement.PRISE_ELECTRIQUE]: 'Prise Électrique',
    [TypeEquipement.INTERRUPTEUR]: 'Interrupteur',
    [TypeEquipement.LAMPE]: 'Lampe',
    [TypeEquipement.PLAFONNIER]: 'Plafonnier',
    [TypeEquipement.TABLEAU_BLANC]: 'Tableau Blanc',
    [TypeEquipement.TABLEAU_NOIR]: 'Tableau Noir',
    [TypeEquipement.PROJECTEUR]: 'Projecteur',
    [TypeEquipement.ECRAN_PROJECTION]: 'Écran de Projection',
    [TypeEquipement.ORDINATEUR]: 'Ordinateur',
    [TypeEquipement.EXTINCTEUR]: 'Extincteur',
    [TypeEquipement.DETECTEUR_FUMEE]: 'Détecteur de Fumée',
    [TypeEquipement.AUTRE]: 'Autre',
};

/**
 * Categories d'equipements pour regroupement et statistiques
 */
export enum CategorieEquipement {
    MOBILIER = 'MOBILIER',
    ELECTROMENAGER = 'ELECTROMENAGER',
    SANITAIRE = 'SANITAIRE',
    INSTALLATION_FIXE = 'INSTALLATION_FIXE',
    PEDAGOGIQUE = 'PEDAGOGIQUE',
    SECURITE = 'SECURITE',
    AUTRE = 'AUTRE',
}

/**
 * Mapping type equipement vers categorie
 */
export const TypeEquipementCategorie: Record<TypeEquipement, CategorieEquipement> = {
    [TypeEquipement.LIT]: CategorieEquipement.MOBILIER,
    [TypeEquipement.TABLE]: CategorieEquipement.MOBILIER,
    [TypeEquipement.CHAISE]: CategorieEquipement.MOBILIER,
    [TypeEquipement.ARMOIRE]: CategorieEquipement.MOBILIER,
    [TypeEquipement.BUREAU]: CategorieEquipement.MOBILIER,
    [TypeEquipement.ETAGERE]: CategorieEquipement.MOBILIER,
    [TypeEquipement.CLIMATISEUR]: CategorieEquipement.ELECTROMENAGER,
    [TypeEquipement.VENTILATEUR]: CategorieEquipement.ELECTROMENAGER,
    [TypeEquipement.REFRIGERATEUR]: CategorieEquipement.ELECTROMENAGER,
    [TypeEquipement.TELEVISEUR]: CategorieEquipement.ELECTROMENAGER,
    [TypeEquipement.LAVABO]: CategorieEquipement.SANITAIRE,
    [TypeEquipement.WC]: CategorieEquipement.SANITAIRE,
    [TypeEquipement.DOUCHE]: CategorieEquipement.SANITAIRE,
    [TypeEquipement.CHAUFFE_EAU]: CategorieEquipement.SANITAIRE,
    [TypeEquipement.PORTE]: CategorieEquipement.INSTALLATION_FIXE,
    [TypeEquipement.FENETRE]: CategorieEquipement.INSTALLATION_FIXE,
    [TypeEquipement.PRISE_ELECTRIQUE]: CategorieEquipement.INSTALLATION_FIXE,
    [TypeEquipement.INTERRUPTEUR]: CategorieEquipement.INSTALLATION_FIXE,
    [TypeEquipement.LAMPE]: CategorieEquipement.INSTALLATION_FIXE,
    [TypeEquipement.PLAFONNIER]: CategorieEquipement.INSTALLATION_FIXE,
    [TypeEquipement.TABLEAU_BLANC]: CategorieEquipement.PEDAGOGIQUE,
    [TypeEquipement.TABLEAU_NOIR]: CategorieEquipement.PEDAGOGIQUE,
    [TypeEquipement.PROJECTEUR]: CategorieEquipement.PEDAGOGIQUE,
    [TypeEquipement.ECRAN_PROJECTION]: CategorieEquipement.PEDAGOGIQUE,
    [TypeEquipement.ORDINATEUR]: CategorieEquipement.PEDAGOGIQUE,
    [TypeEquipement.EXTINCTEUR]: CategorieEquipement.SECURITE,
    [TypeEquipement.DETECTEUR_FUMEE]: CategorieEquipement.SECURITE,
    [TypeEquipement.AUTRE]: CategorieEquipement.AUTRE,
};

/**
 * Equipements considerés comme critiques pour la securite
 * Leur dysfonctionnement genere une priorite haute
 */
export const EQUIPEMENTS_CRITIQUES: TypeEquipement[] = [
    TypeEquipement.EXTINCTEUR,
    TypeEquipement.DETECTEUR_FUMEE,
    TypeEquipement.CHAUFFE_EAU,
    TypeEquipement.PRISE_ELECTRIQUE,
];

/**
 * Duree de vie estimee en mois par type d'equipement
 * Utilise pour les predictions de maintenance
 */
export const DUREE_VIE_ESTIMEE: Record<TypeEquipement, number> = {
    [TypeEquipement.LIT]: 120,           // 10 ans
    [TypeEquipement.TABLE]: 120,
    [TypeEquipement.CHAISE]: 60,         // 5 ans
    [TypeEquipement.ARMOIRE]: 120,
    [TypeEquipement.BUREAU]: 120,
    [TypeEquipement.ETAGERE]: 120,
    [TypeEquipement.CLIMATISEUR]: 84,    // 7 ans
    [TypeEquipement.VENTILATEUR]: 60,
    [TypeEquipement.REFRIGERATEUR]: 96,  // 8 ans
    [TypeEquipement.TELEVISEUR]: 72,     // 6 ans
    [TypeEquipement.LAVABO]: 180,        // 15 ans
    [TypeEquipement.WC]: 180,
    [TypeEquipement.DOUCHE]: 120,
    [TypeEquipement.CHAUFFE_EAU]: 96,
    [TypeEquipement.PORTE]: 240,         // 20 ans
    [TypeEquipement.FENETRE]: 240,
    [TypeEquipement.PRISE_ELECTRIQUE]: 240,
    [TypeEquipement.INTERRUPTEUR]: 180,
    [TypeEquipement.LAMPE]: 36,          // 3 ans
    [TypeEquipement.PLAFONNIER]: 60,
    [TypeEquipement.TABLEAU_BLANC]: 120,
    [TypeEquipement.TABLEAU_NOIR]: 180,
    [TypeEquipement.PROJECTEUR]: 48,     // 4 ans
    [TypeEquipement.ECRAN_PROJECTION]: 96,
    [TypeEquipement.ORDINATEUR]: 48,
    [TypeEquipement.EXTINCTEUR]: 60,
    [TypeEquipement.DETECTEUR_FUMEE]: 120,
    [TypeEquipement.AUTRE]: 60,
};

/**
 * Obtient la categorie d'un type d'equipement
 */
export function getCategorie(type: TypeEquipement): CategorieEquipement {
    return TypeEquipementCategorie[type];
}

/**
 * Verifie si un equipement est critique pour la securite
 */
export function estEquipementCritique(type: TypeEquipement): boolean {
    return EQUIPEMENTS_CRITIQUES.includes(type);
}