// src/infrastructure/persistence/repositories/equipement.repository.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not } from 'typeorm';
import { Equipement } from '../../../domain/entities';
import {
    TypeEquipement,
    StatutEquipement,
    CategorieEquipement,
    getCategorie,
} from '../../../domain/enums';
import { Specification } from '../../../domain/specifications';
import {
    IEquipementRepository,
    EquipementFilters,
    EquipementsResume,
    EquipementAvecRisque,
    PaginationOptions,
    SortOptions,
    PaginatedResult,
} from '../../../domain/repositories';
import { EquipementOrmEntity } from '../entities/equipement.orm-entity';
import { EquipementOrmMapper } from '../mappers/equipement.orm-mapper';

/**
 * Implementation TypeORM du repository Equipement
 */
@Injectable()
export class EquipementRepository implements IEquipementRepository {
    constructor(
        @InjectRepository(EquipementOrmEntity)
        private readonly ormRepository: Repository<EquipementOrmEntity>,
        private readonly mapper: EquipementOrmMapper,
    ) {}

    async findById(id: string): Promise<Equipement | null> {
        const entity = await this.ormRepository.findOne({ where: { id } });
        return entity ? this.mapper.toDomain(entity) : null;
    }

    async findAll(): Promise<Equipement[]> {
        const entities = await this.ormRepository.find({
            order: { type: 'ASC', createdAt: 'DESC' },
        });
        return this.mapper.toDomainList(entities);
    }

    async findPaginated(
        options: PaginationOptions,
        sort?: SortOptions,
    ): Promise<PaginatedResult<Equipement>> {
        const { page, limit } = options;
        const skip = (page - 1) * limit;

        const orderField = sort?.field || 'createdAt';
        const orderDirection = sort?.order || 'DESC';

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

    async save(entity: Equipement): Promise<Equipement> {
        const ormEntity = this.mapper.toPersistence(entity);
        const saved = await this.ormRepository.save(ormEntity);
        return this.mapper.toDomain(saved);
    }

    async saveMany(entities: Equipement[]): Promise<Equipement[]> {
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

    async findByNumeroSerie(numeroSerie: string): Promise<Equipement | null> {
        const entity = await this.ormRepository.findOne({
            where: { numeroSerie },
        });
        return entity ? this.mapper.toDomain(entity) : null;
    }

    async findByEspaceId(espaceId: string): Promise<Equipement[]> {
        const entities = await this.ormRepository.find({
            where: { espaceId, actif: true },
            order: { type: 'ASC' },
        });
        return this.mapper.toDomainList(entities);
    }

    async findByEtageId(etageId: string): Promise<Equipement[]> {
        const entities = await this.ormRepository
            .createQueryBuilder('eq')
            .innerJoin('espaces', 'e', 'eq."espaceId" = e.id')
            .where('e."etageId" = :etageId', { etageId })
            .andWhere('eq.actif = true')
            .orderBy('eq.type', 'ASC')
            .getMany();
        return this.mapper.toDomainList(entities);
    }

    async findByBatimentId(batimentId: string): Promise<Equipement[]> {
        const entities = await this.ormRepository
            .createQueryBuilder('eq')
            .innerJoin('espaces', 'e', 'eq."espaceId" = e.id')
            .innerJoin('etages', 'et', 'e."etageId" = et.id')
            .where('et."batimentId" = :batimentId', { batimentId })
            .andWhere('eq.actif = true')
            .orderBy('eq.type', 'ASC')
            .getMany();
        return this.mapper.toDomainList(entities);
    }

    async findByType(type: TypeEquipement): Promise<Equipement[]> {
        const entities = await this.ormRepository.find({
            where: { type, actif: true },
            order: { createdAt: 'DESC' },
        });
        return this.mapper.toDomainList(entities);
    }

    async findByStatut(statut: StatutEquipement): Promise<Equipement[]> {
        const entities = await this.ormRepository.find({
            where: { statut, actif: true },
            order: { updatedAt: 'DESC' },
        });
        return this.mapper.toDomainList(entities);
    }

    async findDefectueux(): Promise<Equipement[]> {
        const entities = await this.ormRepository.find({
            where: {
                statut: Not(StatutEquipement.BON_ETAT),
                actif: true,
            },
            order: { updatedAt: 'DESC' },
        });
        return this.mapper.toDomainList(entities);
    }

    async findDefectueuxByEspace(espaceId: string): Promise<Equipement[]> {
        const entities = await this.ormRepository.find({
            where: {
                espaceId,
                statut: Not(StatutEquipement.BON_ETAT),
                actif: true,
            },
            order: { type: 'ASC' },
        });
        return this.mapper.toDomainList(entities);
    }

    async findARemplacer(): Promise<Equipement[]> {
        const entities = await this.ormRepository.find({
            where: {
                statut: In([StatutEquipement.A_REMPLACER, StatutEquipement.HORS_SERVICE]),
                actif: true,
            },
            order: { updatedAt: 'DESC' },
        });
        return this.mapper.toDomainList(entities);
    }

    async findNonAssignes(): Promise<Equipement[]> {
        const entities = await this.ormRepository
            .createQueryBuilder('eq')
            .where('eq."espaceId" IS NULL')
            .andWhere('eq.actif = true')
            .orderBy('eq.type', 'ASC')
            .getMany();
        return this.mapper.toDomainList(entities);
    }

    async findAssignables(): Promise<Equipement[]> {
        const entities = await this.ormRepository
            .createQueryBuilder('eq')
            .where('eq."espaceId" IS NULL')
            .andWhere('eq.statut = :statut', { statut: StatutEquipement.BON_ETAT })
            .andWhere('eq.actif = true')
            .orderBy('eq.type', 'ASC')
            .getMany();
        return this.mapper.toDomainList(entities);
    }

    async findBySpecification(spec: Specification<Equipement>): Promise<Equipement[]> {
        const allEntities = await this.ormRepository.find({ where: { actif: true } });
        const domainEntities = this.mapper.toDomainList(allEntities);
        return domainEntities.filter(e => spec.isSatisfiedBy(e));
    }

    async numeroSerieExists(numeroSerie: string): Promise<boolean> {
        const count = await this.ormRepository.count({
            where: { numeroSerie },
        });
        return count > 0;
    }

    async updateStatut(
        equipementId: string,
        statut: StatutEquipement,
    ): Promise<void> {
        await this.ormRepository.update(equipementId, {
            statut,
            updatedAt: new Date(),
        });
    }

    async assignerAEspace(equipementId: string, espaceId: string): Promise<void> {
        await this.ormRepository.update(equipementId, {
            espaceId,
            dateInstallation: new Date(),
            updatedAt: new Date(),
        });
    }

    async retirerDeEspace(equipementId: string): Promise<void> {
        await this.ormRepository.update(equipementId, {
            espaceId: null,
            updatedAt: new Date(),
        });
    }

    async countDefectueuxByEspace(espaceId: string): Promise<number> {
        return this.ormRepository.count({
            where: {
                espaceId,
                statut: Not(StatutEquipement.BON_ETAT),
                actif: true,
            },
        });
    }

    async getResume(batimentId?: string): Promise<EquipementsResume> {
        let baseQuery = this.ormRepository.createQueryBuilder('eq');

        if (batimentId) {
            baseQuery = baseQuery
                .innerJoin('espaces', 'e', 'eq."espaceId" = e.id')
                .innerJoin('etages', 'et', 'e."etageId" = et.id')
                .where('et."batimentId" = :batimentId', { batimentId });
        }

        // Total
        const total = await baseQuery.clone().andWhere('eq.actif = true').getCount();

        // Assignes
        const assignes = await baseQuery
            .clone()
            .andWhere('eq."espaceId" IS NOT NULL')
            .andWhere('eq.actif = true')
            .getCount();

        // Par statut
        const statutResults = await this.ormRepository
            .createQueryBuilder('eq')
            .select('eq.statut', 'statut')
            .addSelect('COUNT(*)', 'count')
            .where('eq.actif = true')
            .groupBy('eq.statut')
            .getRawMany();

        const parStatut: Record<StatutEquipement, number> = {} as Record<StatutEquipement, number>;
        for (const s of Object.values(StatutEquipement)) {
            parStatut[s] = 0;
        }
        for (const row of statutResults) {
            parStatut[row.statut as StatutEquipement] = parseInt(row.count) || 0;
        }

        // Par categorie (calcule a partir du type)
        const typeResults = await this.ormRepository
            .createQueryBuilder('eq')
            .select('eq.type', 'type')
            .addSelect('COUNT(*)', 'count')
            .where('eq.actif = true')
            .groupBy('eq.type')
            .getRawMany();

        const parCategorie: Record<CategorieEquipement, number> = {} as Record<CategorieEquipement, number>;
        for (const c of Object.values(CategorieEquipement)) {
            parCategorie[c] = 0;
        }
        for (const row of typeResults) {
            const cat = getCategorie(row.type as TypeEquipement);
            parCategorie[cat] += parseInt(row.count) || 0;
        }

        // Par type
        const parType: Record<TypeEquipement, number> = {} as Record<TypeEquipement, number>;
        for (const t of Object.values(TypeEquipement)) {
            parType[t] = 0;
        }
        for (const row of typeResults) {
            parType[row.type as TypeEquipement] = parseInt(row.count) || 0;
        }

        // A risque (score > 70)
        const allEquipements = await this.ormRepository.find({ where: { actif: true } });
        const domainEquipements = this.mapper.toDomainList(allEquipements);
        const aRisque = domainEquipements.filter(e => e.calculerScoreRisque() >= 70).length;

        return {
            total,
            assignes,
            nonAssignes: total - assignes,
            parStatut,
            parType,
            parCategorie,
            aRisque,
        };
    }

    async findAvecScoreRisque(seuilMin?: number): Promise<EquipementAvecRisque[]> {
        const entities = await this.ormRepository.find({ where: { actif: true } });
        const domainEntities = this.mapper.toDomainList(entities);

        return domainEntities
            .map(e => {
                const scoreRisque = e.calculerScoreRisque();
                const facteurs: string[] = [];

                // Determiner les facteurs de risque
                const vieRestante = e.getPourcentageVieRestante();
                if (vieRestante !== null && vieRestante < 30) {
                    facteurs.push('Vie restante faible');
                }
                if (e.historiquePannes >= 3) {
                    facteurs.push('Pannes frequentes');
                }
                if (e.estDefectueux()) {
                    facteurs.push('Statut defectueux');
                }
                if (e.derniereDatePanne) {
                    const moisDepuisPanne = (Date.now() - e.derniereDatePanne.getTime()) / (1000 * 60 * 60 * 24 * 30);
                    if (moisDepuisPanne < 6) {
                        facteurs.push('Panne recente');
                    }
                }

                return {
                    equipement: e,
                    scoreRisque,
                    facteurs,
                };
            })
            .filter(item => {
                if (seuilMin !== undefined && item.scoreRisque < seuilMin) return false;
                return true;
            })
            .sort((a, b) => b.scoreRisque - a.scoreRisque);
    }

    async findHautRisque(seuil?: number): Promise<Equipement[]> {
        const seuilScore = seuil ?? 70;
        const results = await this.findAvecScoreRisque(seuilScore);
        return results.map(r => r.equipement);
    }

    async findVieillissants(pourcentageVieMax: number): Promise<Equipement[]> {
        const entities = await this.ormRepository.find({ where: { actif: true } });
        const domainEntities = this.mapper.toDomainList(entities);

        return domainEntities.filter(e => {
            const pourcentage = e.getPourcentageVieRestante();
            return pourcentage !== null && pourcentage <= pourcentageVieMax;
        });
    }

    async countByStatutForEspace(
        espaceId: string,
    ): Promise<Record<StatutEquipement, number>> {
        const results = await this.ormRepository
            .createQueryBuilder('eq')
            .select('eq.statut', 'statut')
            .addSelect('COUNT(*)', 'count')
            .where('eq."espaceId" = :espaceId', { espaceId })
            .andWhere('eq.actif = true')
            .groupBy('eq.statut')
            .getRawMany();

        const counts: Record<StatutEquipement, number> = {} as Record<StatutEquipement, number>;
        for (const s of Object.values(StatutEquipement)) {
            counts[s] = 0;
        }
        for (const row of results) {
            counts[row.statut as StatutEquipement] = parseInt(row.count) || 0;
        }

        return counts;
    }

    async findWithFilters(
        filters: EquipementFilters,
        pagination: PaginationOptions,
        sort?: SortOptions,
    ): Promise<PaginatedResult<Equipement>> {
        const { page, limit } = pagination;
        const skip = (page - 1) * limit;
        const orderField = sort?.field || 'createdAt';
        const orderDirection = sort?.order || 'DESC';

        const qb = this.ormRepository.createQueryBuilder('eq');

        if (filters.espaceId) {
            qb.andWhere('eq."espaceId" = :espaceId', { espaceId: filters.espaceId });
        }
        if (filters.type) {
            qb.andWhere('eq.type = :type', { type: filters.type });
        }
        if (filters.types && filters.types.length > 0) {
            qb.andWhere('eq.type IN (:...types)', { types: filters.types });
        }
        if (filters.statut) {
            qb.andWhere('eq.statut = :statut', { statut: filters.statut });
        }
        if (filters.statuts && filters.statuts.length > 0) {
            qb.andWhere('eq.statut IN (:...statuts)', { statuts: filters.statuts });
        }
        if (filters.actif !== undefined) {
            qb.andWhere('eq.actif = :actif', { actif: filters.actif });
        } else {
            qb.andWhere('eq.actif = true');
        }
        if (filters.estAssigne !== undefined) {
            if (filters.estAssigne) {
                qb.andWhere('eq."espaceId" IS NOT NULL');
            } else {
                qb.andWhere('eq."espaceId" IS NULL');
            }
        }
        if (filters.marque) {
            qb.andWhere('eq.marque ILIKE :marque', { marque: `%${filters.marque}%` });
        }

        const [entities, total] = await qb
            .orderBy(`eq.${orderField}`, orderDirection)
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

    async softDelete(id: string): Promise<boolean> {
        const result = await this.ormRepository.update(id, {
            actif: false,
            updatedAt: new Date(),
        });
        return (result.affected ?? 0) > 0;
    }

    async deleteByEspaceId(espaceId: string): Promise<number> {
        const result = await this.ormRepository.update(
            { espaceId },
            { actif: false, updatedAt: new Date() },
        );
        return result.affected ?? 0;
    }
}