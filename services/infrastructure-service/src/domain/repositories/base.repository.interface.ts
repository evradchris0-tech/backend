// src/domain/repositories/base.repository.interface.ts

/**
 * Options de pagination
 */
export interface PaginationOptions {
    page: number;
    limit: number;
}

/**
 * Options de tri
 */
export interface SortOptions {
    field: string;
    order: 'ASC' | 'DESC';
}

/**
 * Resultat pagine
 */
export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

/**
 * Interface de base pour tous les repositories
 * Definit les operations CRUD communes
 */
export interface BaseRepository<T, ID = string> {
    /**
     * Trouve une entite par son identifiant
     */
    findById(id: ID): Promise<T | null>;

    /**
     * Trouve toutes les entites
     */
    findAll(): Promise<T[]>;

    /**
     * Trouve les entites avec pagination
     */
    findPaginated(
        options: PaginationOptions,
        sort?: SortOptions,
    ): Promise<PaginatedResult<T>>;

    /**
     * Sauvegarde une entite (creation ou mise a jour)
     */
    save(entity: T): Promise<T>;

    /**
     * Sauvegarde plusieurs entites
     */
    saveMany(entities: T[]): Promise<T[]>;

    /**
     * Supprime une entite par son identifiant
     */
    delete(id: ID): Promise<boolean>;

    /**
     * Verifie si une entite existe
     */
    exists(id: ID): Promise<boolean>;

    /**
     * Compte le nombre total d'entites
     */
    count(): Promise<number>;
}