// src/application/dto/batiment/batiment-response.dto.ts

import { TypeBatiment } from '../../../domain/enums';

/**
 * DTO de reponse pour les coordonnees
 */
export class CoordonneesResponseDto {
    latitude: number;
    longitude: number;
    altitude?: number;
}

/**
 * DTO de reponse pour un batiment (vue liste)
 */
export class BatimentListResponseDto {
    id: string;
    nom: string;
    code: string;
    type: TypeBatiment;
    typeLabel: string;
    nombreEtages: number;
    actif: boolean;
    dateCreation: Date;
}

/**
 * DTO de reponse pour un batiment (vue detail)
 */
export class BatimentDetailResponseDto {
    id: string;
    nom: string;
    code: string;
    type: TypeBatiment;
    typeLabel: string;
    adresse: string | null;
    coordonnees: CoordonneesResponseDto | null;
    nombreEtages: number;
    superficie: number | null;
    dateConstruction: Date | null;
    description: string | null;
    planBatiment: string | null;
    actif: boolean;
    dateCreation: Date;
    dateModification: Date;
}

/**
 * DTO de reponse pour un batiment avec statistiques
 */
export class BatimentWithStatsResponseDto extends BatimentDetailResponseDto {
    stats: {
        nombreEspaces: number;
        nombreEquipements: number;
        nombreEquipementsDefectueux: number;
        nombreEspacesDefectueux: number;
        tauxEquipementsEnBonEtat: number;
    };
}

/**
 * DTO pour la liste paginee de batiments
 */
export class BatimentPaginatedResponseDto {
    data: BatimentListResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}