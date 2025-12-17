// src/domain/repositories/espace.repository.interface.ts

import { Espace } from '../entities';
import { TypeEspace } from '../enums';
import { Specification } from '../specifications';
import {
    BaseRepository,
    PaginatedResult,
    PaginationOptions,
    SortOptions,
} from './base.repository.interface';

/**
 * Filtres de recherche pour les espaces
 */
export interface EspaceFilters {
    etageId?: string;
    batimentId?: string;
    type?: TypeEspace;
    types?: TypeEspace[];
    actif?: boolean;
    estOccupe?: boolean;
    aEquipementDefectueux?: boolean;
    rechercheTexte?: string;
    occupantId?: string;
}

/**
 * Statistiques d'un espace
 */
export interface EspaceStats {
    espaceId: string;
    nombreEquipements: number;
    nombreEquipementsDefectueux: number;
    nombreIncidentsTotal: number;
    nombreIncidentsResolus: number;
    nombreIncidentsEnCours: number;
}

/**
 * Resume des espaces par statut
 */
export interface EspacesResume {
    total: number;
    actifs: number;
    defectueux: number;
    occupes: number;
    libres: number;
    parType: Record<TypeEspace, number>;
}

/**
 * Token d'injection pour le repository Espace
 */
export const ESPACE_REPOSITORY = Symbol('ESPACE_REPOSITORY');

/**
 * Interface du repository Espace
 */
export interface IEspaceRepository extends BaseRepository<Espace> {
    /**
     * Trouve tous les espaces d'un etage
     */
    findByEtageId(etageId: string): Promise<Espace[]>;

    /**
     * Trouve tous les espaces d'un batiment (tous etages confondus)
     */
    findByBatimentId(batimentId: string): Promise<Espace[]>;

    /**
     * Trouve un espace par son numero dans un etage
     */
    findByEtageAndNumero(etageId: string, numero: string): Promise<Espace | null>;

    /**
     * Trouve un espace par son numero dans un batiment (recherche globale)
     */
    findByBatimentAndNumero(batimentId: string, numero: string): Promise<Espace | null>;

    /**
     * Trouve les espaces actifs d'un etage
     */
    findActifsByEtage(etageId: string): Promise<Espace[]>;

    /**
     * Trouve les espaces defectueux
     */
    findDefectueux(): Promise<Espace[]>;

    /**
     * Trouve les espaces defectueux d'un batiment
     */
    findDefectueuxByBatiment(batimentId: string): Promise<Espace[]>;

    /**
     * Trouve les chambres occupees
     */
    findChambresOccupees(): Promise<Espace[]>;

    /**
     * Trouve les chambres libres
     */
    findChambresLibres(): Promise<Espace[]>;

    /**
     * Trouve l'espace d'un occupant
     */
    findByOccupantId(occupantId: string): Promise<Espace | null>;

    /**
     * Recherche avec filtres et pagination
     */
    findWithFilters(
        filters: EspaceFilters,
        pagination: PaginationOptions,
        sort?: SortOptions,
    ): Promise<PaginatedResult<Espace>>;

    /**
     * Recherche avec une Specification (pattern)
     */
    findBySpecification(spec: Specification<Espace>): Promise<Espace[]>;

    /**
     * Verifie si un numero d'espace existe dans un etage
     */
    numeroExists(etageId: string, numero: string, excludeId?: string): Promise<boolean>;

    /**
     * Met a jour le flag aEquipementDefectueux
     */
    updateDefectueuxFlag(
        espaceId: string,
        aEquipementDefectueux: boolean,
        nombreEquipementsDefectueux: number,
    ): Promise<void>;

    /**
     * Assigne un occupant a un espace
     */
    assignerOccupant(espaceId: string, occupantId: string): Promise<void>;

    /**
     * Libere un espace (retire l'occupant)
     */
    liberer(espaceId: string): Promise<void>;

    /**
     * Obtient les statistiques d'un espace
     */
    getStats(espaceId: string): Promise<EspaceStats | null>;

    /**
     * Obtient le resume des espaces d'un batiment
     */
    getResume(batimentId?: string): Promise<EspacesResume>;

    /**
     * Trouve les espaces les plus defectueux (top N)
     */
    findMostDefectueux(limit: number, batimentId?: string): Promise<Espace[]>;

    /**
     * Trouve les espaces sans aucun incident
     */
    findSansIncident(batimentId?: string): Promise<Espace[]>;

    /**
     * Compte les espaces par type
     */
    countByType(batimentId?: string): Promise<Record<TypeEspace, number>>;

    /**
     * Soft delete
     */
    softDelete(id: string): Promise<boolean>;

    /**
     * Supprime tous les espaces d'un etage
     */
    deleteByEtageId(etageId: string): Promise<number>;
}