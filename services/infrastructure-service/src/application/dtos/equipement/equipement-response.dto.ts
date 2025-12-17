// src/application/dto/equipement/equipement-response.dto.ts

import {
    TypeEquipement,
    StatutEquipement,
    CategorieEquipement,
} from '../../../domain/enums';
import { LocalisationResponseDto } from '../espace/espace-response.dto';

/**
 * Historique d'un changement de statut
 */
export class HistoriqueStatutResponseDto {
    ancienStatut: StatutEquipement | null;
    nouveauStatut: StatutEquipement;
    motif: string;
    date: Date;
}

/**
 * DTO de reponse pour un equipement (vue liste)
 */
export class EquipementListResponseDto {
    id: string;
    type: TypeEquipement;
    typeLabel: string;
    categorie: CategorieEquipement;
    marque: string | null;
    modele: string | null;
    statut: StatutEquipement;
    statutLabel: string;
    espaceId: string | null;
    espaceNumero: string | null;
    actif: boolean;
}

/**
 * DTO de reponse pour un equipement (vue detail)
 */
export class EquipementDetailResponseDto {
    id: string;
    type: TypeEquipement;
    typeLabel: string;
    categorie: CategorieEquipement;
    marque: string | null;
    modele: string | null;
    numeroSerie: string | null;
    statut: StatutEquipement;
    statutLabel: string;
    espaceId: string | null;
    dateAcquisition: Date | null;
    valeurAchat: number | null;
    description: string | null;
    historiquePannes: number;
    derniereDatePanne: Date | null;
    dateInstallation: Date | null;
    dateDerniereIntervention: Date | null;
    actif: boolean;
    dateCreation: Date;
    dateModification: Date;
    localisation: LocalisationResponseDto | null;
}

/**
 * DTO de reponse avec indicateurs de risque
 */
export class EquipementWithRisqueResponseDto extends EquipementDetailResponseDto {
    scoreRisque: number;
    pourcentageVieRestante: number | null;
    tauxPanneAnnuel: number | null;
    necessiteRemplacement: boolean;
    facteurRisque: string[];
    historiqueStatuts: HistoriqueStatutResponseDto[];
}

/**
 * DTO pour la liste paginee d'equipements
 */
export class EquipementPaginatedResponseDto {
    data: EquipementListResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

/**
 * DTO pour le resume des equipements
 */
export class EquipementsResumeResponseDto {
    total: number;
    parStatut: Record<StatutEquipement, number>;
    parType: Record<TypeEquipement, number>;
    parCategorie: Record<CategorieEquipement, number>;
    assignes: number;
    nonAssignes: number;
    aRisque: number;
}

/**
 * DTO pour les predictions de maintenance
 */
export class PredictionMaintenanceResponseDto {
    equipementId: string;
    type: TypeEquipement;
    typeLabel: string;
    localisation: LocalisationResponseDto | null;
    scoreRisque: number;
    probabilitePanne: number;
    facteurs: string[];
    recommandation: string;
}