// src/domain/repositories/equipement.repository.interface.ts

import { Equipement } from '../entities';
import {
    TypeEquipement,
    StatutEquipement,
    CategorieEquipement,
} from '../enums';
import { Specification } from '../specifications';
import {
    BaseRepository,
    PaginatedResult,
    PaginationOptions,
    SortOptions,
} from './base.repository.interface';

/**
 * Filtres de recherche pour les equipements
 */
export interface EquipementFilters {
    espaceId?: string;
    etageId?: string;
    batimentId?: string;
    type?: TypeEquipement;
    types?: TypeEquipement[];
    categorie?: CategorieEquipement;
    statut?: StatutEquipement;
    statuts?: StatutEquipement[];
    actif?: boolean;
    estAssigne?: boolean;
    rechercheTexte?: string;
    scoreRisqueMin?: number;
    marque?: string;
}

/**
 * Resume des equipements par statut
 */
export interface EquipementsResume {
    total: number;
    parStatut: Record<StatutEquipement, number>;
    parType: Record<TypeEquipement, number>;
    parCategorie: Record<CategorieEquipement, number>;
    assignes: number;
    nonAssignes: number;
    aRisque: number;
}

/**
 * Equipement avec score de risque pour predictions
 */
export interface EquipementAvecRisque {
    equipement: Equipement;
    scoreRisque: number;
    facteurs: string[];
}

/**
 * Token d'injection pour le repository Equipement
 */
export const EQUIPEMENT_REPOSITORY = Symbol('EQUIPEMENT_REPOSITORY');

/**
 * Interface du repository Equipement
 */
export interface IEquipementRepository extends BaseRepository<Equipement> {
    /**
     * Trouve un equipement par son numero de serie
     */
    findByNumeroSerie(numeroSerie: string): Promise<Equipement | null>;

    /**
     * Trouve tous les equipements d'un espace
     */
    findByEspaceId(espaceId: string): Promise<Equipement[]>;

    /**
     * Trouve tous les equipements d'un etage
     */
    findByEtageId(etageId: string): Promise<Equipement[]>;

    /**
     * Trouve tous les equipements d'un batiment
     */
    findByBatimentId(batimentId: string): Promise<Equipement[]>;

    /**
     * Trouve les equipements par type
     */
    findByType(type: TypeEquipement): Promise<Equipement[]>;

    /**
     * Trouve les equipements par statut
     */
    findByStatut(statut: StatutEquipement): Promise<Equipement[]>;

    /**
     * Trouve les equipements defectueux
     */
    findDefectueux(): Promise<Equipement[]>;

    /**
     * Trouve les equipements defectueux d'un espace
     */
    findDefectueuxByEspace(espaceId: string): Promise<Equipement[]>;

    /**
     * Trouve les equipements a remplacer
     */
    findARemplacer(): Promise<Equipement[]>;

    /**
     * Trouve les equipements non assignes
     */
    findNonAssignes(): Promise<Equipement[]>;

    /**
     * Trouve les equipements assignables (bon etat et non assignes)
     */
    findAssignables(type?: TypeEquipement): Promise<Equipement[]>;

    /**
     * Recherche avec filtres et pagination
     */
    findWithFilters(
        filters: EquipementFilters,
        pagination: PaginationOptions,
        sort?: SortOptions,
    ): Promise<PaginatedResult<Equipement>>;

    /**
     * Recherche avec une Specification
     */
    findBySpecification(spec: Specification<Equipement>): Promise<Equipement[]>;

    /**
     * Verifie si un numero de serie existe
     */
    numeroSerieExists(numeroSerie: string, excludeId?: string): Promise<boolean>;

    /**
     * Met a jour le statut d'un equipement
     */
    updateStatut(
        equipementId: string,
        nouveauStatut: StatutEquipement,
    ): Promise<void>;

    /**
     * Assigne un equipement a un espace
     */
    assignerAEspace(equipementId: string, espaceId: string): Promise<void>;

    /**
     * Retire un equipement de son espace
     */
    retirerDeEspace(equipementId: string): Promise<void>;

    /**
     * Compte les equipements defectueux d'un espace
     */
    countDefectueuxByEspace(espaceId: string): Promise<number>;

    /**
     * Obtient le resume des equipements
     */
    getResume(batimentId?: string): Promise<EquipementsResume>;

    /**
     * Obtient les equipements avec leur score de risque
     */
    findAvecScoreRisque(seuilMin?: number): Promise<EquipementAvecRisque[]>;

    /**
     * Obtient les equipements a haut risque pour predictions
     */
    findHautRisque(seuil?: number): Promise<Equipement[]>;

    /**
     * Obtient les equipements vieillissants
     */
    findVieillissants(seuilPourcentageVieRestante?: number): Promise<Equipement[]>;

    /**
     * Compte les equipements par statut pour un espace
     */
    countByStatutForEspace(espaceId: string): Promise<Record<StatutEquipement, number>>;

    /**
     * Soft delete
     */
    softDelete(id: string): Promise<boolean>;

    /**
     * Supprime tous les equipements d'un espace
     */
    deleteByEspaceId(espaceId: string): Promise<number>;
}