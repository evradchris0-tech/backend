// src/application/dto/etage/etage-response.dto.ts

/**
 * DTO de reponse pour un etage (vue liste)
 */
export class EtageListResponseDto {
    id: string;
    batimentId: string;
    numero: number;
    designation: string;
    superficie: number | null;
    actif: boolean;
    dateCreation: Date;
}

/**
 * DTO de reponse pour un etage (vue detail)
 */
export class EtageDetailResponseDto {
    id: string;
    batimentId: string;
    batimentNom?: string;
    numero: number;
    designation: string;
    superficie: number | null;
    planEtage: string | null;
    actif: boolean;
    dateCreation: Date;
    dateModification: Date;
}

/**
 * DTO de reponse pour un etage avec statistiques
 */
export class EtageWithStatsResponseDto extends EtageDetailResponseDto {
    stats: {
        nombreEspaces: number;
        nombreEquipements: number;
        nombreEquipementsDefectueux: number;
        nombreEspacesDefectueux: number;
    };
}

/**
 * DTO pour la liste paginee d'etages
 */
export class EtagePaginatedResponseDto {
    data: EtageListResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}
