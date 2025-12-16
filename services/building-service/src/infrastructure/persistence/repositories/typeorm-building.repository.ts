import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IBuildingRepository } from '../../../domain/repositories/building.repository.interface.ts';
import { BuildingEntity } from '../../../domain/entities/building.entity';

@Injectable()
export class TypeOrmBuildingRepository implements IBuildingRepository {
    constructor(
        @InjectRepository(BuildingEntity)
        private readonly repository: Repository<BuildingEntity>,
    ) { }

    async save(building: BuildingEntity): Promise<BuildingEntity> {
        return this.repository.save(building);
    }

    async findAll(): Promise<BuildingEntity[]> {
        return this.repository.find({ relations: ['site', 'floors'] });
    }

    async findById(id: string): Promise<BuildingEntity | null> {
        return this.repository.findOne({
            where: { id },
            relations: ['floors'] // On charge souvent les étages avec le bâtiment
        });
    }

    async findByCode(code: string, siteId: string): Promise<BuildingEntity | null> {
        return this.repository.findOne({ where: { code, siteId } });
    }

    async findBySiteId(siteId: string): Promise<BuildingEntity[]> {
        return this.repository.find({ where: { siteId } });
    }

    async exists(code: string, siteId: string): Promise<boolean> {
        const count = await this.repository.count({ where: { code, siteId } });
        return count > 0;
    }

    async delete(id: string): Promise<void> {
        await this.repository.delete(id);
    }

    async update(id: string, building: BuildingEntity): Promise<BuildingEntity> {
        return this.repository.save(building);
    }
    async updateStatus(id: string, status: string): Promise<BuildingEntity> {
        const building = await this.findById(id);
        if (!building) throw new Error('Building not found');
        building.status = status;
        return this.repository.save(building);
    }

    async updateLocationData(id: string, locationData: { x: number; y: number; z: number; rotation: number }): Promise<BuildingEntity> {
        const building = await this.findById(id);
        if (!building) throw new Error('Building not found');
        building.locationData = locationData;
        return this.repository.save(building);
    }

    async updateMetadata(id: string, metadata: Record<string, any>): Promise<BuildingEntity> {
        const building = await this.findById(id);
        if (!building) throw new Error('Building not found');
        building.metadata = metadata;
        return this.repository.save(building);
    }

    async updateFloorsCount(id: string, floorsCount: number): Promise<BuildingEntity> {
        const building = await this.findById(id);
        if (!building) throw new Error('Building not found');
        building.floorsCount = floorsCount;
        return this.repository.save(building);
    }

    async updateTotalCapacity(id: string, totalCapacity: number): Promise<BuildingEntity> {
        const building = await this.findById(id);
        if (!building) throw new Error('Building not found');
        building.totalCapacity = totalCapacity;
        return this.repository.save(building);
    }

    async updateSiteId(id: string, siteId: string): Promise<BuildingEntity> {
        const building = await this.findById(id);
        if (!building) throw new Error('Building not found');
        building.siteId = siteId;
        return this.repository.save(building);
    }

    async updateName(id: string, name: string): Promise<BuildingEntity> {
        const building = await this.findById(id);
        if (!building) throw new Error('Building not found');
        building.name = name;
        return this.repository.save(building);
    }

    async updateCode(id: string, code: string): Promise<BuildingEntity> {
        const building = await this.findById(id);
        if (!building) throw new Error('Building not found');
        building.code = code;
        return this.repository.save(building);
    }

    async updateType(id: string, type: string): Promise<BuildingEntity> {
        const building = await this.findById(id);
        if (!building) throw new Error('Building not found');
        building.type = type as any;
        return this.repository.save(building);
    }

    async updateDescription(id: string, description: string): Promise<BuildingEntity> {
        const building = await this.findById(id);
        if (!building) throw new Error('Building not found');
        // Assuming there's a description field
        (building as any).description = description;
        return this.repository.save(building);
    }

    async updateCapacity(id: string, capacity: number): Promise<BuildingEntity> {
        const building = await this.findById(id);
        if (!building) throw new Error('Building not found');
        // Assuming there's a capacity field
        (building as any).capacity = capacity;
        return this.repository.save(building);
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