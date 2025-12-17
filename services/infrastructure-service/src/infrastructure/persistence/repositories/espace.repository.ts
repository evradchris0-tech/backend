// src/infrastructure/persistence/repositories/espace.repository.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, In } from 'typeorm';
import { Espace } from '../../../domain/entities';
import { TypeEspace, estUneChambre } from '../../../domain/enums';
import { Specification } from '../../../domain/specifications';
import {
    IEspaceRepository,
    EspaceFilters,
    EspaceStats,
    EspacesResume,
    PaginationOptions,
    SortOptions,
    PaginatedResult,
} from '../../../domain/repositories';
import { EspaceOrmEntity } from '../entities/espace.orm-entity';
import { EspaceOrmMapper } from '../mappers/espace.orm-mapper';

/**
 * Implementation TypeORM du repository Espace
 */
@Injectable()
export class EspaceRepository implements IEspaceRepository {
    constructor(
        @InjectRepository(EspaceOrmEntity)
        private readonly ormRepository: Repository<EspaceOrmEntity>,
        private readonly mapper: EspaceOrmMapper,
    ) {}

    async findById(id: string): Promise<Espace | null> {
        const entity = await this.ormRepository.findOne({ where: { id } });
        return entity ? this.mapper.toDomain(entity) : null;
    }

    async findAll(): Promise<Espace[]> {
        const entities = await this.ormRepository.find({
            order: { numero: 'ASC' },
        });
        return this.mapper.toDomainList(entities);
    }

    async findPaginated(
        options: PaginationOptions,
        sort?: SortOptions,
    ): Promise<PaginatedResult<Espace>> {
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

    async save(entity: Espace): Promise<Espace> {
        const ormEntity = this.mapper.toPersistence(entity);
        const saved = await this.ormRepository.save(ormEntity);
        return this.mapper.toDomain(saved);
    }

    async saveMany(entities: Espace[]): Promise<Espace[]> {
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

    async findByEtageId(etageId: string): Promise<Espace[]> {
        const entities = await this.ormRepository.find({
            where: { etageId },
            order: { numero: 'ASC' },
        });
        return this.mapper.toDomainList(entities);
    }

    async findActifsByEtage(etageId: string): Promise<Espace[]> {
        const entities = await this.ormRepository.find({
            where: { etageId, actif: true },
            order: { numero: 'ASC' },
        });
        return this.mapper.toDomainList(entities);
    }

    async findByBatimentId(batimentId: string): Promise<Espace[]> {
        const entities = await this.ormRepository
            .createQueryBuilder('e')
            .innerJoin('etages', 'et', 'e."etageId" = et.id')
            .where('et."batimentId" = :batimentId', { batimentId })
            .andWhere('e.actif = true')
            .orderBy('et.numero', 'ASC')
            .addOrderBy('e.numero', 'ASC')
            .getMany();
        return this.mapper.toDomainList(entities);
    }

    async findByEtageAndNumero(etageId: string, numero: string): Promise<Espace | null> {
        const entity = await this.ormRepository.findOne({
            where: { etageId, numero },
        });
        return entity ? this.mapper.toDomain(entity) : null;
    }

    async findByBatimentAndNumero(
        batimentId: string,
        numero: string,
    ): Promise<Espace | null> {
        const entity = await this.ormRepository
            .createQueryBuilder('e')
            .innerJoin('etages', 'et', 'e."etageId" = et.id')
            .where('et."batimentId" = :batimentId', { batimentId })
            .andWhere('e.numero = :numero', { numero })
            .getOne();
        return entity ? this.mapper.toDomain(entity) : null;
    }

    async findDefectueux(): Promise<Espace[]> {
        const entities = await this.ormRepository.find({
            where: { aEquipementDefectueux: true, actif: true },
            order: { nombreEquipementsDefectueux: 'DESC' },
        });
        return this.mapper.toDomainList(entities);
    }

    async findDefectueuxByBatiment(batimentId: string): Promise<Espace[]> {
        const entities = await this.ormRepository
            .createQueryBuilder('e')
            .innerJoin('etages', 'et', 'e."etageId" = et.id')
            .where('et."batimentId" = :batimentId', { batimentId })
            .andWhere('e."aEquipementDefectueux" = true')
            .andWhere('e.actif = true')
            .orderBy('e."nombreEquipementsDefectueux"', 'DESC')
            .getMany();
        return this.mapper.toDomainList(entities);
    }

    async findChambresOccupees(): Promise<Espace[]> {
        const chambreTypes = [
            TypeEspace.CHAMBRE_SIMPLE,
            TypeEspace.CHAMBRE_DOUBLE,
            TypeEspace.CHAMBRE_TRIPLE,
        ];
        const entities = await this.ormRepository.find({
            where: {
                type: In(chambreTypes),
                estOccupe: true,
                actif: true,
            },
            order: { numero: 'ASC' },
        });
        return this.mapper.toDomainList(entities);
    }

    async findChambresLibres(): Promise<Espace[]> {
        const chambreTypes = [
            TypeEspace.CHAMBRE_SIMPLE,
            TypeEspace.CHAMBRE_DOUBLE,
            TypeEspace.CHAMBRE_TRIPLE,
        ];
        const entities = await this.ormRepository.find({
            where: {
                type: In(chambreTypes),
                estOccupe: false,
                actif: true,
            },
            order: { numero: 'ASC' },
        });
        return this.mapper.toDomainList(entities);
    }

    async findByOccupantId(occupantId: string): Promise<Espace | null> {
        const entity = await this.ormRepository.findOne({
            where: { occupantId },
        });
        return entity ? this.mapper.toDomain(entity) : null;
    }

    async findBySpecification(spec: Specification<Espace>): Promise<Espace[]> {
        // Charger toutes les entites et filtrer en memoire
        // Pour des specifications plus complexes, il faudrait traduire en SQL
        const allEntities = await this.ormRepository.find({ where: { actif: true } });
        const domainEntities = this.mapper.toDomainList(allEntities);
        return domainEntities.filter(e => spec.isSatisfiedBy(e));
    }

    async updateDefectueuxFlag(
        espaceId: string,
        aEquipementDefectueux: boolean,
        nombreEquipementsDefectueux: number,
    ): Promise<void> {
        await this.ormRepository.update(espaceId, {
            aEquipementDefectueux,
            nombreEquipementsDefectueux,
            updatedAt: new Date(),
        });
    }

    async assignerOccupant(espaceId: string, occupantId: string): Promise<void> {
        await this.ormRepository.update(espaceId, {
            occupantId,
            estOccupe: true,
            updatedAt: new Date(),
        });
    }

    async liberer(espaceId: string): Promise<void> {
        await this.ormRepository.update(espaceId, {
            occupantId: null,
            estOccupe: false,
            updatedAt: new Date(),
        });
    }

    async getStats(espaceId: string): Promise<EspaceStats> {
        const result = await this.ormRepository.query(
            `
            SELECT 
                (SELECT COUNT(*) FROM equipements WHERE "espaceId" = $1 AND actif = true) as "nombreEquipements",
                (SELECT COUNT(*) FROM equipements WHERE "espaceId" = $1 AND statut != 'BON_ETAT' AND actif = true) as "nombreEquipementsDefectueux"
            `,
            [espaceId],
        );

        const stats = result[0] || {};
        return {
            espaceId,
            nombreEquipements: parseInt(stats.nombreEquipements) || 0,
            nombreEquipementsDefectueux: parseInt(stats.nombreEquipementsDefectueux) || 0,
            nombreIncidentsTotal: 0, // A implementer avec le service incidents
            nombreIncidentsResolus: 0,
            nombreIncidentsEnCours: 0,
        };
    }

    async getResume(batimentId?: string): Promise<EspacesResume> {
        let query = this.ormRepository.createQueryBuilder('e');

        if (batimentId) {
            query = query
                .innerJoin('etages', 'et', 'e."etageId" = et.id')
                .where('et."batimentId" = :batimentId', { batimentId });
        }

        // Statistiques globales
        const totalResult = await query.clone().getCount();
        const actifsResult = await query.clone().andWhere('e.actif = true').getCount();
        const defectueuxResult = await query
            .clone()
            .andWhere('e."aEquipementDefectueux" = true')
            .andWhere('e.actif = true')
            .getCount();
        const occupesResult = await query
            .clone()
            .andWhere('e."estOccupe" = true')
            .andWhere('e.actif = true')
            .getCount();

        // Comptage par type
        const typeResults = await this.ormRepository
            .createQueryBuilder('e')
            .select('e.type', 'type')
            .addSelect('COUNT(*)', 'count')
            .where('e.actif = true')
            .groupBy('e.type')
            .getRawMany();

        const parType: Record<TypeEspace, number> = {} as Record<TypeEspace, number>;
        for (const t of Object.values(TypeEspace)) {
            parType[t] = 0;
        }
        for (const row of typeResults) {
            parType[row.type as TypeEspace] = parseInt(row.count) || 0;
        }

        // Compter les chambres libres
        const chambreTypes = [
            TypeEspace.CHAMBRE_SIMPLE,
            TypeEspace.CHAMBRE_DOUBLE,
            TypeEspace.CHAMBRE_TRIPLE,
        ];
        const nombreChambres = chambreTypes.reduce((sum, t) => sum + (parType[t] || 0), 0);
        const libres = nombreChambres - occupesResult;

        return {
            total: totalResult,
            actifs: actifsResult,
            defectueux: defectueuxResult,
            occupes: occupesResult,
            libres: libres > 0 ? libres : 0,
            parType,
        };
    }

    async findMostDefectueux(limit: number, batimentId?: string): Promise<Espace[]> {
        let query = this.ormRepository
            .createQueryBuilder('e')
            .where('e."aEquipementDefectueux" = true')
            .andWhere('e.actif = true')
            .orderBy('e."nombreEquipementsDefectueux"', 'DESC')
            .take(limit);

        if (batimentId) {
            query = query
                .innerJoin('etages', 'et', 'e."etageId" = et.id')
                .andWhere('et."batimentId" = :batimentId', { batimentId });
        }

        const entities = await query.getMany();
        return this.mapper.toDomainList(entities);
    }

    async findSansIncident(batimentId?: string): Promise<Espace[]> {
        let query = this.ormRepository
            .createQueryBuilder('e')
            .where('e."aEquipementDefectueux" = false')
            .andWhere('e.actif = true')
            .orderBy('e.numero', 'ASC');

        if (batimentId) {
            query = query
                .innerJoin('etages', 'et', 'e."etageId" = et.id')
                .andWhere('et."batimentId" = :batimentId', { batimentId });
        }

        const entities = await query.getMany();
        return this.mapper.toDomainList(entities);
    }

    async countByType(batimentId?: string): Promise<Record<TypeEspace, number>> {
        let query = this.ormRepository
            .createQueryBuilder('e')
            .select('e.type', 'type')
            .addSelect('COUNT(*)', 'count')
            .where('e.actif = true')
            .groupBy('e.type');

        if (batimentId) {
            query = query
                .innerJoin('etages', 'et', 'e."etageId" = et.id')
                .andWhere('et."batimentId" = :batimentId', { batimentId });
        }

        const results = await query.getRawMany();

        const counts: Record<TypeEspace, number> = {} as Record<TypeEspace, number>;
        for (const t of Object.values(TypeEspace)) {
            counts[t] = 0;
        }
        for (const row of results) {
            counts[row.type as TypeEspace] = parseInt(row.count) || 0;
        }

        return counts;
    }

    async findWithFilters(
        filters: EspaceFilters,
        pagination: PaginationOptions,
        sort?: SortOptions,
    ): Promise<PaginatedResult<Espace>> {
        const { page, limit } = pagination;
        const skip = (page - 1) * limit;
        const orderField = sort?.field || 'numero';
        const orderDirection = sort?.order || 'ASC';

        const qb = this.ormRepository.createQueryBuilder('e');

        if (filters.etageId) {
            qb.andWhere('e."etageId" = :etageId', { etageId: filters.etageId });
        }
        if (filters.type) {
            qb.andWhere('e.type = :type', { type: filters.type });
        }
        if (filters.types && filters.types.length > 0) {
            qb.andWhere('e.type IN (:...types)', { types: filters.types });
        }
        if (filters.actif !== undefined) {
            qb.andWhere('e.actif = :actif', { actif: filters.actif });
        } else {
            qb.andWhere('e.actif = true');
        }
        if (filters.estOccupe !== undefined) {
            qb.andWhere('e."estOccupe" = :estOccupe', { estOccupe: filters.estOccupe });
        }
        if (filters.aEquipementDefectueux !== undefined) {
            qb.andWhere('e."aEquipementDefectueux" = :aDefectueux', {
                aDefectueux: filters.aEquipementDefectueux,
            });
        }
        if (filters.occupantId) {
            qb.andWhere('e."occupantId" = :occupantId', { occupantId: filters.occupantId });
        }

        const [entities, total] = await qb
            .orderBy(`e.${orderField}`, orderDirection)
            .skip(skip)
            .take(limit)
            .getManyAndCount();

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

    async numeroExists(etageId: string, numero: string, excludeId?: string): Promise<boolean> {
        let query = this.ormRepository
            .createQueryBuilder('e')
            .where('e."etageId" = :etageId', { etageId })
            .andWhere('e.numero = :numero', { numero });

        if (excludeId) {
            query = query.andWhere('e.id != :excludeId', { excludeId });
        }

        const count = await query.getCount();
        return count > 0;
    }

    async softDelete(id: string): Promise<boolean> {
        const result = await this.ormRepository.update(id, {
            actif: false,
            updatedAt: new Date(),
        });
        return (result.affected ?? 0) > 0;
    }

    async deleteByEtageId(etageId: string): Promise<number> {
        const result = await this.ormRepository.update(
            { etageId },
            { actif: false, updatedAt: new Date() },
        );
        return result.affected ?? 0;
    }
}