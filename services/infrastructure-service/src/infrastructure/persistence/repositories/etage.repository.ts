// src/infrastructure/persistence/repositories/etage.repository.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Etage } from '../../../domain/entities';
import {
    IEtageRepository,
    EtageFilters,
    EtageStats,
    PaginationOptions,
    SortOptions,
    PaginatedResult,
} from '../../../domain/repositories';
import { EtageOrmEntity } from '../entities/etage.orm-entity';
import { EtageOrmMapper } from '../mappers/etage.orm-mapper';

/**
 * Implementation TypeORM du repository Etage
 */
@Injectable()
export class EtageRepository implements IEtageRepository {
    constructor(
        @InjectRepository(EtageOrmEntity)
        private readonly ormRepository: Repository<EtageOrmEntity>,
        private readonly mapper: EtageOrmMapper,
    ) {}

    async findById(id: string): Promise<Etage | null> {
        const entity = await this.ormRepository.findOne({ where: { id } });
        return entity ? this.mapper.toDomain(entity) : null;
    }

    async findAll(): Promise<Etage[]> {
        const entities = await this.ormRepository.find({
            order: { batimentId: 'ASC', numero: 'ASC' },
        });
        return this.mapper.toDomainList(entities);
    }

    async findPaginated(
        options: PaginationOptions,
        sort?: SortOptions,
    ): Promise<PaginatedResult<Etage>> {
        const { page, limit } = options;
        const skip = (page - 1) * limit;

        const orderField = sort?.field || 'numero';
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

    async save(entity: Etage): Promise<Etage> {
        const ormEntity = this.mapper.toPersistence(entity);
        const saved = await this.ormRepository.save(ormEntity);
        return this.mapper.toDomain(saved);
    }

    async saveMany(entities: Etage[]): Promise<Etage[]> {
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

    async findByBatimentId(batimentId: string): Promise<Etage[]> {
        const entities = await this.ormRepository.find({
            where: { batimentId },
            order: { numero: 'ASC' },
        });
        return this.mapper.toDomainList(entities);
    }

    async findByBatimentAndNumero(
        batimentId: string,
        numero: number,
    ): Promise<Etage | null> {
        const entity = await this.ormRepository.findOne({
            where: { batimentId, numero },
        });
        return entity ? this.mapper.toDomain(entity) : null;
    }

    async findActifsByBatiment(batimentId: string): Promise<Etage[]> {
        const entities = await this.ormRepository.find({
            where: { batimentId, actif: true },
            order: { numero: 'ASC' },
        });
        return this.mapper.toDomainList(entities);
    }

    async numeroExists(batimentId: string, numero: number): Promise<boolean> {
        const count = await this.ormRepository.count({
            where: { batimentId, numero },
        });
        return count > 0;
    }

    async getStats(etageId: string): Promise<EtageStats> {
        const result = await this.ormRepository.query(
            `
            SELECT 
                (SELECT COUNT(*) FROM espaces WHERE "etageId" = $1 AND actif = true) as "nombreEspaces",
                (SELECT COUNT(*) FROM equipements eq 
                    JOIN espaces e ON eq."espaceId" = e.id 
                    WHERE e."etageId" = $1 AND eq.actif = true) as "nombreEquipements",
                (SELECT COUNT(*) FROM espaces WHERE "etageId" = $1 AND "aEquipementDefectueux" = true AND actif = true) as "nombreEspacesDefectueux",
                (SELECT COUNT(*) FROM equipements eq 
                    JOIN espaces e ON eq."espaceId" = e.id 
                    WHERE e."etageId" = $1 AND eq.statut != 'BON_ETAT' AND eq.actif = true) as "nombreEquipementsDefectueux"
            `,
            [etageId],
        );

        const stats = result[0] || {};
        // Recuperer l'etage pour avoir le batimentId
        const etage = await this.findById(etageId);
        const batimentId = etage?.batimentId ?? '';

        // Calculer les espaces occupes
        const occupesResult = await this.ormRepository.query(
            `SELECT COUNT(*) as count FROM espaces
             WHERE "etageId" = $1 AND "occupantId" IS NOT NULL AND actif = true`,
            [etageId],
        );
        const nombreEspacesOccupes = parseInt(occupesResult[0]?.count) || 0;
        const nombreEspaces = parseInt(stats.nombreEspaces) || 0;
        const tauxOccupation = nombreEspaces > 0
            ? Math.round((nombreEspacesOccupes / nombreEspaces) * 100)
            : 0;

        return {
            etageId,
            batimentId,
            nombreEspaces,
            nombreEquipements: parseInt(stats.nombreEquipements) || 0,
            nombreEspacesDefectueux: parseInt(stats.nombreEspacesDefectueux) || 0,
            nombreEquipementsDefectueux: parseInt(stats.nombreEquipementsDefectueux) || 0,
            nombreEspacesOccupes,
            tauxOccupation,
        };
    }

    async getStatsByBatiment(batimentId: string): Promise<EtageStats[]> {
        const etages = await this.findActifsByBatiment(batimentId);
        const statsPromises = etages.map(async e => {
            return this.getStats(e.id);
        });
        return Promise.all(statsPromises);
    }

    async countByBatiment(batimentId: string): Promise<number> {
        return this.ormRepository.count({
            where: { batimentId, actif: true },
        });
    }

    async deleteByBatimentId(batimentId: string): Promise<number> {
        const result = await this.ormRepository.delete({ batimentId });
        return result.affected ?? 0;
    }

    async findWithFilters(
        filters: EtageFilters,
        pagination: PaginationOptions,
        sort?: SortOptions,
    ): Promise<PaginatedResult<Etage>> {
        const { page, limit } = pagination;
        const skip = (page - 1) * limit;
        const orderField = sort?.field || 'numero';
        const orderDirection = sort?.order || 'ASC';

        const where: FindOptionsWhere<EtageOrmEntity> = {};

        if (filters.batimentId) {
            where.batimentId = filters.batimentId;
        }
        if (filters.actif !== undefined) {
            where.actif = filters.actif;
        }

        const [entities, total] = await this.ormRepository.findAndCount({
            where,
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

    async softDelete(id: string): Promise<boolean> {
        const result = await this.ormRepository.update(id, {
            actif: false,
            updatedAt: new Date(),
        });
        return (result.affected ?? 0) > 0;
    }
}