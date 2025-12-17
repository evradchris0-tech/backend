// src/infrastructure/persistence/repositories/batiment.repository.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, ILike } from 'typeorm';
import { Batiment } from '../../../domain/entities';
import { TypeBatiment } from '../../../domain/enums';
import {
    IBatimentRepository,
    BatimentFilters,
    BatimentStats,
    PaginationOptions,
    SortOptions,
    PaginatedResult,
} from '../../../domain/repositories';
import { BatimentOrmEntity } from '../entities/batiment.orm-entity';
import { BatimentOrmMapper } from '../mappers/batiment.orm-mapper';

/**
 * Implementation TypeORM du repository Batiment
 * Adapte les operations de persistance vers PostgreSQL
 */
@Injectable()
export class BatimentRepository implements IBatimentRepository {
    constructor(
        @InjectRepository(BatimentOrmEntity)
        private readonly ormRepository: Repository<BatimentOrmEntity>,
        private readonly mapper: BatimentOrmMapper,
    ) {}

    async findById(id: string): Promise<Batiment | null> {
        const entity = await this.ormRepository.findOne({ where: { id } });
        return entity ? this.mapper.toDomain(entity) : null;
    }

    async findAll(): Promise<Batiment[]> {
        const entities = await this.ormRepository.find({
            order: { nom: 'ASC' },
        });
        return this.mapper.toDomainList(entities);
    }

    async findPaginated(
        options: PaginationOptions,
        sort?: SortOptions,
    ): Promise<PaginatedResult<Batiment>> {
        const { page, limit } = options;
        const skip = (page - 1) * limit;

        const orderField = sort?.field || 'nom';
        const orderDirection = sort?.order || 'ASC';

        const [entities, total] = await this.ormRepository.findAndCount({
            skip,
            take: limit,
            order: { [orderField]: orderDirection },
        });

        const totalPages = Math.ceil(total / limit);

        return {
            data: this.mapper.toDomainList(entities),
            total,
            page,
            limit,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
        };
    }

    async save(entity: Batiment): Promise<Batiment> {
        const ormEntity = this.mapper.toPersistence(entity);
        const saved = await this.ormRepository.save(ormEntity);
        return this.mapper.toDomain(saved);
    }

    async saveMany(entities: Batiment[]): Promise<Batiment[]> {
        const ormEntities = entities.map(e => this.mapper.toPersistence(e));
        const saved = await this.ormRepository.save(ormEntities);
        return this.mapper.toDomainList(saved);
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.ormRepository.delete(id);
        return (result.affected ?? 0) > 0;
    }

    async exists(id: string): Promise<boolean> {
        const count = await this.ormRepository.count({ where: { id } });
        return count > 0;
    }

    async count(): Promise<number> {
        return this.ormRepository.count();
    }

    async findByCode(code: string): Promise<Batiment | null> {
        const entity = await this.ormRepository.findOne({
            where: { code: code.toUpperCase() },
        });
        return entity ? this.mapper.toDomain(entity) : null;
    }

    async findByType(type: TypeBatiment): Promise<Batiment[]> {
        const entities = await this.ormRepository.find({
            where: { type },
            order: { nom: 'ASC' },
        });
        return this.mapper.toDomainList(entities);
    }

    async findActifs(): Promise<Batiment[]> {
        const entities = await this.ormRepository.find({
            where: { actif: true },
            order: { nom: 'ASC' },
        });
        return this.mapper.toDomainList(entities);
    }

    async findWithFilters(
        filters: BatimentFilters,
        pagination: PaginationOptions,
    ): Promise<PaginatedResult<Batiment>> {
        const { page, limit } = pagination;
        const skip = (page - 1) * limit;

        const where: FindOptionsWhere<BatimentOrmEntity> = {};

        if (filters.type) {
            where.type = filters.type;
        }
        if (filters.actif !== undefined) {
            where.actif = filters.actif;
        }
        if (filters.rechercheTexte) {
            // Recherche dans nom ou code
            where.nom = ILike(`%${filters.rechercheTexte}%`);
        }

        const [entities, total] = await this.ormRepository.findAndCount({
            where,
            skip,
            take: limit,
            order: { nom: 'ASC' },
        });

        const totalPages = Math.ceil(total / limit);

        return {
            data: this.mapper.toDomainList(entities),
            total,
            page,
            limit,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
        };
    }

    async codeExists(code: string): Promise<boolean> {
        const count = await this.ormRepository.count({
            where: { code: code.toUpperCase() },
        });
        return count > 0;
    }

    async getStats(batimentId: string): Promise<BatimentStats> {
        // Requete pour obtenir les statistiques du batiment
        const result = await this.ormRepository.query(
            `
            SELECT 
                (SELECT COUNT(*) FROM etages WHERE "batimentId" = $1 AND actif = true) as "nombreEtages",
                (SELECT COUNT(*) FROM espaces e 
                    JOIN etages et ON e."etageId" = et.id 
                    WHERE et."batimentId" = $1 AND e.actif = true) as "nombreEspaces",
                (SELECT COUNT(*) FROM equipements eq 
                    JOIN espaces e ON eq."espaceId" = e.id 
                    JOIN etages et ON e."etageId" = et.id 
                    WHERE et."batimentId" = $1 AND eq.actif = true) as "nombreEquipements",
                (SELECT COUNT(*) FROM espaces e 
                    JOIN etages et ON e."etageId" = et.id 
                    WHERE et."batimentId" = $1 AND e."aEquipementDefectueux" = true AND e.actif = true) as "nombreEspacesDefectueux",
                (SELECT COUNT(*) FROM equipements eq 
                    JOIN espaces e ON eq."espaceId" = e.id 
                    JOIN etages et ON e."etageId" = et.id 
                    WHERE et."batimentId" = $1 AND eq.statut != 'BON_ETAT' AND eq.actif = true) as "nombreEquipementsDefectueux"
            `,
            [batimentId],
        );

        const stats = result[0] || {};
        const nombreEquipements = parseInt(stats.nombreEquipements) || 0;
        const nombreEquipementsDefectueux = parseInt(stats.nombreEquipementsDefectueux) || 0;
        const tauxEquipementsEnBonEtat = nombreEquipements > 0
            ? Math.round(((nombreEquipements - nombreEquipementsDefectueux) / nombreEquipements) * 100)
            : 100;

        return {
            batimentId,
            nombreEtages: parseInt(stats.nombreEtages) || 0,
            nombreEspaces: parseInt(stats.nombreEspaces) || 0,
            nombreEquipements,
            nombreEspacesDefectueux: parseInt(stats.nombreEspacesDefectueux) || 0,
            nombreEquipementsDefectueux,
            tauxEquipementsEnBonEtat,
        };
    }

    async getAllStats(): Promise<BatimentStats[]> {
        const batiments = await this.findActifs();
        const statsPromises = batiments.map(async b => {
            return this.getStats(b.id);
        });
        return Promise.all(statsPromises);
    }

    async countByType(): Promise<Record<TypeBatiment, number>> {
        const result = await this.ormRepository
            .createQueryBuilder('b')
            .select('b.type', 'type')
            .addSelect('COUNT(*)', 'count')
            .where('b.actif = true')
            .groupBy('b.type')
            .getRawMany();

        const counts: Record<TypeBatiment, number> = {
            [TypeBatiment.PEDAGOGIQUE]: 0,
            [TypeBatiment.ADMINISTRATIF]: 0,
            [TypeBatiment.CITE_UNIVERSITAIRE]: 0,
            [TypeBatiment.RESIDENCE_PERSONNEL]: 0,
            [TypeBatiment.MIXTE]: 0,
        };

        for (const row of result) {
            counts[row.type as TypeBatiment] = parseInt(row.count) || 0;
        }

        return counts;
    }

    async softDelete(id: string): Promise<boolean> {
        const result = await this.ormRepository.update(id, {
            actif: false,
            updatedAt: new Date(),
        });
        return (result.affected ?? 0) > 0;
    }
}