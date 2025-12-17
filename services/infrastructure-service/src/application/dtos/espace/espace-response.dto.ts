// src/application/dto/espace/espace-response.dto.ts

import { TypeEspace } from '../../../domain/enums';

/**
 * Localisation complete d'un espace
 */
export class LocalisationResponseDto {
    batimentId: string;
    batimentNom: string;
    batimentCode: string;
    etageId: string;
    etageNumero: number;
    etageDesignation: string;
    formatCourt: string;
    formatComplet: string;
}

/**
 * DTO de reponse pour un espace (vue liste)
 */
export class EspaceListResponseDto {
    id: string;
    numero: string;
    type: TypeEspace;
    typeLabel: string;
    estOccupe: boolean;
    aEquipementDefectueux: boolean;
    nombreEquipementsDefectueux: number;
    actif: boolean;
    localisation: LocalisationResponseDto;
}

/**
 * DTO de reponse pour un espace (vue detail)
 */
export class EspaceDetailResponseDto {
    id: string;
    etageId: string;
    numero: string;
    type: TypeEspace;
    typeLabel: string;
    superficie: number | null;
    capacite: number | null;
    description: string | null;
    estOccupe: boolean;
    occupantId: string | null;
    aEquipementDefectueux: boolean;
    nombreEquipementsDefectueux: number;
    actif: boolean;
    dateCreation: Date;
    dateModification: Date;
    localisation: LocalisationResponseDto;
}

/**
 * DTO de reponse pour un espace avec ses equipements
 */
export class EspaceWithEquipementsResponseDto extends EspaceDetailResponseDto {
    equipements: {
        id: string;
        type: string;
        typeLabel: string;
        marque: string | null;
        modele: string | null;
        statut: string;
        statutLabel: string;
    }[];
}

/**
 * DTO pour la liste paginee d'espaces
 */
export class EspacePaginatedResponseDto {
    data: EspaceListResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

/**
 * DTO pour le resume des espaces
 */
export class EspacesResumeResponseDto {
    total: number;
    actifs: number;
    defectueux: number;
    occupes: number;
    libres: number;
    parType: Record<TypeEspace, number>;
}