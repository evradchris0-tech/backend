// src/domain/repositories/batiment.repository.interface.ts

import { Batiment } from '../entities';
import { TypeBatiment } from '../enums';
import {
    BaseRepository,
    PaginatedResult,
    PaginationOptions,
    SortOptions,
} from './base.repository.interface';

/**
 * Filtres de recherche pour les batiments
 */
export interface BatimentFilters {
    type?: TypeBatiment;
    actif?: boolean;
    rechercheTexte?: string;
}

/**
 * Statistiques d'un batiment
 */
export interface BatimentStats {
    batimentId: string;
    nombreEtages: number;
    nombreEspaces: number;
    nombreEquipements: number;
    nombreEquipementsDefectueux: number;
    nombreEspacesDefectueux: number;
    tauxEquipementsEnBonEtat: number;
}

/**
 * Token d'injection pour le repository Batiment
 */
export const BATIMENT_REPOSITORY = Symbol('BATIMENT_REPOSITORY');

/**
 * Interface du repository Batiment
 * Definit les operations specifiques aux batiments
 */
export interface IBatimentRepository extends BaseRepository<Batiment> {
    /**
     * Trouve un batiment par son code unique
     */
    findByCode(code: string): Promise<Batiment | null>;

    /**
     * Trouve tous les batiments d'un type specifique
     */
    findByType(type: TypeBatiment): Promise<Batiment[]>;

    /**
     * Trouve les batiments actifs
     */
    findActifs(): Promise<Batiment[]>;

    /**
     * Recherche avec filtres et pagination
     */
    findWithFilters(
        filters: BatimentFilters,
        pagination: PaginationOptions,
        sort?: SortOptions,
    ): Promise<PaginatedResult<Batiment>>;

    /**
     * Verifie si un code de batiment existe deja
     */
    codeExists(code: string, excludeId?: string): Promise<boolean>;

    /**
     * Obtient les statistiques d'un batiment
     */
    getStats(batimentId: string): Promise<BatimentStats | null>;

    /**
     * Obtient les statistiques de tous les batiments
     */
    getAllStats(): Promise<BatimentStats[]>;

    /**
     * Compte les batiments par type
     */
    countByType(): Promise<Record<TypeBatiment, number>>;

    /**
     * Soft delete (desactivation)
     */
    softDelete(id: string): Promise<boolean>;
}