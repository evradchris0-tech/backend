import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ISpaceRepository } from '../../../domain/repositories/space.repository.interface.ts';
import { SpaceEntity } from '../../../domain/entities/space.entity';
import { SpaceType } from '../../../domain/enums/space-type.enum.ts';

@Injectable()
export class TypeOrmSpaceRepository implements ISpaceRepository {
    constructor(
        @InjectRepository(SpaceEntity)
        private readonly repository: Repository<SpaceEntity>,
    ) { }

    async save(space: SpaceEntity): Promise<SpaceEntity> {
        return this.repository.save(space);
    }

    async findById(id: string): Promise<SpaceEntity | null> {
        return this.repository.findOne({ where: { id }, relations: ['floor'] });
    }

    async findByFloorId(floorId: string): Promise<SpaceEntity[]> {
        return this.repository.find({
            where: { floorId },
            order: { number: 'ASC' }
        });
    }

    async findByBuildingId(buildingId: string): Promise<SpaceEntity[]> {
        return this.repository.find({ where: { buildingId } });
    }

    async findByNumber(number: string, floorId: string): Promise<SpaceEntity | null> {
        return this.repository.findOne({ where: { number, floorId } });
    }

    // Optimisé pour la 3D : on sélectionne uniquement les champs nécessaires
    async findWithBabylonConfig(buildingId: string): Promise<SpaceEntity[]> {
        return this.repository.find({
            where: { buildingId },
            select: ['id', 'number', 'type', 'status', 'babylonConfig', 'floorId']
        });
    }

    async delete(id: string): Promise<void> {
        await this.repository.delete(id);
    }

    async update(id: string, space: SpaceEntity): Promise<SpaceEntity> {
        return this.repository.save(space);
    }
    
    async updateStatus(id: string, status: string): Promise<SpaceEntity> {
        const space = await this.findById(id);
        if (!space) throw new Error('Space not found');
        space.status = status;
        return this.repository.save(space);
    }
    
    async updateCapacity(id: string, capacity: number): Promise<SpaceEntity> {
        const space = await this.findById(id);
        if (!space) throw new Error('Space not found');
        space.capacity = capacity;
        return this.repository.save(space);
    }
    
    async updateSurfaceArea(id: string, surfaceArea: number): Promise<SpaceEntity> {
        const space = await this.findById(id);
        if (!space) throw new Error('Space not found');
        space.surfaceArea = surfaceArea;
        return this.repository.save(space);
    }
    
    async updateBabylonConfig(id: string, babylonConfig: Record<string, any>): Promise<SpaceEntity> {
        const space = await this.findById(id);
        if (!space) throw new Error('Space not found');
        space.babylonConfig = babylonConfig;
        return this.repository.save(space);
    }
    
    async updateFeatures(id: string, features: Record<string, any>): Promise<SpaceEntity> {
        const space = await this.findById(id);
        if (!space) throw new Error('Space not found');
        space.features = features;
        return this.repository.save(space);
    }

    async updateType(id: string, type: SpaceType): Promise<SpaceEntity> {
        const space = await this.findById(id);
        if (!space) throw new Error('Space not found');
        space.type = type;
        return this.repository.save(space);
    }

    async updateFloorId(id: string, floorId: string): Promise<SpaceEntity> {
        const space = await this.findById(id);
        if (!space) throw new Error('Space not found');
        space.floorId = floorId;
        return this.repository.save(space);
    }
    
    async updateName(id: string, name: string): Promise<SpaceEntity> {
        const space = await this.findById(id);
        if (!space) throw new Error('Space not found');
        space.name = name;
        return this.repository.save(space);
    }

    async updateNumber(id: string, number: string): Promise<SpaceEntity> {
        const space = await this.findById(id);
        if (!space) throw new Error('Space not found');
        space.number = number;
        return this.repository.save(space);
    }
    
    async updateDescription(id: string, description: string): Promise<SpaceEntity> {
        const space = await this.findById(id);
        if (!space) throw new Error('Space not found');
        // Assuming there's a description field
        (space as any).description = description;
        return this.repository.save(space);
    }

    async updateStatusByIds(ids: string[], status: string): Promise<void> {
        await this.repository
            .createQueryBuilder()
            .update(SpaceEntity)
            .set({ status })
            .whereInIds(ids)
            .execute();
    }

    async updateCapacityByIds(ids: string[], capacity: number): Promise<void> {
        await this.repository
            .createQueryBuilder()
            .update(SpaceEntity)
            .set({ capacity })
            .whereInIds(ids)
            .execute();
    }

    async updateSurfaceAreaByIds(ids: string[], surfaceArea: number): Promise<void> {
        await this.repository
            .createQueryBuilder()
            .update(SpaceEntity)
            .set({ surfaceArea })
            .whereInIds(ids)
            .execute();
    }
}