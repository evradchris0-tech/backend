// src/domain/repositories/etage.repository.interface.ts

import { Etage } from '../entities';
import {
    BaseRepository,
    PaginatedResult,
    PaginationOptions,
    SortOptions,
} from './base.repository.interface';

/**
 * Filtres de recherche pour les etages
 */
export interface EtageFilters {
    batimentId?: string;
    actif?: boolean;
    numeroMin?: number;
    numeroMax?: number;
}

/**
 * Statistiques d'un etage
 */
export interface EtageStats {
    etageId: string;
    batimentId: string;
    nombreEspaces: number;
    nombreEquipements: number;
    nombreEquipementsDefectueux: number;
    nombreEspacesDefectueux: number;
    nombreEspacesOccupes: number;
    tauxOccupation: number;
}

/**
 * Token d'injection pour le repository Etage
 */
export const ETAGE_REPOSITORY = Symbol('ETAGE_REPOSITORY');

/**
 * Interface du repository Etage
 */
export interface IEtageRepository extends BaseRepository<Etage> {
    /**
     * Trouve tous les etages d'un batiment
     */
    findByBatimentId(batimentId: string): Promise<Etage[]>;

    /**
     * Trouve un etage par batiment et numero
     */
    findByBatimentAndNumero(batimentId: string, numero: number): Promise<Etage | null>;

    /**
     * Trouve les etages actifs d'un batiment tries par numero
     */
    findActifsByBatiment(batimentId: string): Promise<Etage[]>;

    /**
     * Recherche avec filtres et pagination
     */
    findWithFilters(
        filters: EtageFilters,
        pagination: PaginationOptions,
        sort?: SortOptions,
    ): Promise<PaginatedResult<Etage>>;

    /**
     * Verifie si un numero d'etage existe deja dans un batiment
     */
    numeroExists(batimentId: string, numero: number, excludeId?: string): Promise<boolean>;

    /**
     * Obtient les statistiques d'un etage
     */
    getStats(etageId: string): Promise<EtageStats | null>;

    /**
     * Obtient les statistiques de tous les etages d'un batiment
     */
    getStatsByBatiment(batimentId: string): Promise<EtageStats[]>;

    /**
     * Compte les etages par batiment
     */
    countByBatiment(batimentId: string): Promise<number>;

    /**
     * Soft delete (desactivation)
     */
    softDelete(id: string): Promise<boolean>;

    /**
     * Supprime tous les etages d'un batiment
     */
    deleteByBatimentId(batimentId: string): Promise<number>;
}