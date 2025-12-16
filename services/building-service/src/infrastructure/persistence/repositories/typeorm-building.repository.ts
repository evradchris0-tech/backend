// services/building-service/src/infrastructure/persistence/repositories/typeorm-building.repository.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IBuildingRepository } from '../../../domain/repositories/building.repository.interface';
import { BuildingEntity } from '../../../domain/entities/building.entity';

@Injectable()
export class TypeOrmBuildingRepository implements IBuildingRepository {
    constructor(
        @InjectRepository(BuildingEntity)
        private readonly repository: Repository<BuildingEntity>,
    ) { }

    async save(building: BuildingEntity): Promise<BuildingEntity> {
        try {
            return await this.repository.save(building);
        } catch (error) {
            // Gérer erreur de doublon PostgreSQL (code 23505)
            if (error.code === '23505') {
                throw new Error('Building code already exists for this site');
            }
            throw error;
        }
    }

    async findAll(): Promise<BuildingEntity[]> {
        return this.repository.find({
            relations: ['site', 'floors'],
            order: { createdAt: 'DESC' }
        });
    }

    async findById(id: string): Promise<BuildingEntity | null> {
        return this.repository.findOne({
            where: { id },
            relations: ['site', 'floors']
        });
    }

    async findByCode(code: string, siteId: string): Promise<BuildingEntity | null> {
        return this.repository.findOne({
            where: { code, siteId }
        });
    }

    async findBySiteId(siteId: string): Promise<BuildingEntity[]> {
        return this.repository.find({
            where: { siteId },
            relations: ['floors'],
            order: { name: 'ASC' }
        });
    }

    // ✅ MÉTHODE MANQUANTE IMPLÉMENTÉE
    async exists(code: string, siteId: string): Promise<boolean> {
        const count = await this.repository.count({
            where: { code, siteId }
        });
        return count > 0;
    }

    async findWithRelations(id: string): Promise<BuildingEntity | null> {
        return this.repository
            .createQueryBuilder('building')
            .leftJoinAndSelect('building.site', 'site')
            .leftJoinAndSelect('building.floors', 'floors')
            .leftJoinAndSelect('floors.spaces', 'spaces')
            .where('building.id = :id', { id })
            .getOne();
    }

    async delete(id: string): Promise<void> {
        await this.repository.delete(id);
    }

    async update(id: string, building: BuildingEntity): Promise<BuildingEntity> {
        await this.repository.update(id, building);
        return this.findById(id);
    }

    async updateStatus(id: string, status: string): Promise<BuildingEntity> {
        await this.repository.update(id, { status });
        return this.findById(id);
    }

    async updateLocationData(
        id: string,
        locationData: { x: number; y: number; z: number; rotation: number }
    ): Promise<BuildingEntity> {
        await this.repository.update(id, { locationData });
        return this.findById(id);
    }

    async updateMetadata(id: string, metadata: Record<string, any>): Promise<BuildingEntity> {
        await this.repository.update(id, { metadata });
        return this.findById(id);
    }

    async updateFloorsCount(id: string, floorsCount: number): Promise<BuildingEntity> {
        await this.repository.update(id, { floorsCount });
        return this.findById(id);
    }

    async updateTotalCapacity(id: string, totalCapacity: number): Promise<BuildingEntity> {
        await this.repository.update(id, { totalCapacity });
        return this.findById(id);
    }

    async updateSiteId(id: string, siteId: string): Promise<BuildingEntity> {
        await this.repository.update(id, { siteId });
        return this.findById(id);
    }

    async updateName(id: string, name: string): Promise<BuildingEntity> {
        await this.repository.update(id, { name });
        return this.findById(id);
    }

    async updateCode(id: string, code: string): Promise<BuildingEntity> {
        await this.repository.update(id, { code });
        return this.findById(id);
    }

    async updateType(id: string, type: string): Promise<BuildingEntity> {
        await this.repository.update(id, { type });
        return this.findById(id);
    }

    async updateDescription(id: string, description: string): Promise<BuildingEntity> {
        // Cette méthode suppose qu'il y a un champ description dans metadata
        const building = await this.findById(id);
        if (!building) throw new Error('Building not found');

        const updatedMetadata = {
            ...building.metadata,
            description
        };

        return this.updateMetadata(id, updatedMetadata);
    }

    async updateCapacity(id: string, capacity: number): Promise<BuildingEntity> {
        return this.updateTotalCapacity(id, capacity);
    }

    async updateStatusByIds(ids: string[], status: string): Promise<void> {
        await this.repository
            .createQueryBuilder()
            .update(BuildingEntity)
            .set({ status })
            .whereInIds(ids)
            .execute();
    }
}