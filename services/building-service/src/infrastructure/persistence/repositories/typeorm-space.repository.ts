// services/building-service/src/infrastructure/persistence/repositories/typeorm-space.repository.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ISpaceRepository } from '../../../domain/repositories/space.repository.interface';
import { SpaceEntity } from '../../../domain/entities/space.entity';
import { SpaceType } from '../../../domain/enums/space-type.enum';

@Injectable()
export class TypeOrmSpaceRepository implements ISpaceRepository {
    constructor(
        @InjectRepository(SpaceEntity)
        private readonly repository: Repository<SpaceEntity>,
    ) { }

    async save(space: SpaceEntity): Promise<SpaceEntity> {
        try {
            return await this.repository.save(space);
        } catch (error) {
            if (error.code === '23505') {
                throw new Error('Space number already exists on this floor');
            }
            throw error;
        }
    }

    async findById(id: string): Promise<SpaceEntity | null> {
        return this.repository.findOne({
            where: { id },
            relations: ['floor']
        });
    }

    async findByFloorId(floorId: string): Promise<SpaceEntity[]> {
        return this.repository.find({
            where: { floorId },
            order: { number: 'ASC' }
        });
    }

    async findByBuildingId(buildingId: string): Promise<SpaceEntity[]> {
        return this.repository.find({
            where: { buildingId },
            order: { number: 'ASC' }
        });
    }

    async findByNumber(number: string, floorId: string): Promise<SpaceEntity | null> {
        return this.repository.findOne({
            where: { number, floorId }
        });
    }

    // ✅ CORRECTION: Optimisé pour BabylonJS (sélection partielle)
    async findWithBabylonConfig(buildingId: string): Promise<SpaceEntity[]> {
        return this.repository
            .createQueryBuilder('space')
            .select([
                'space.id',
                'space.number',
                'space.type',
                'space.status',
                'space.babylonConfig',
                'space.floorId'
            ])
            .where('space.buildingId = :buildingId', { buildingId })
            .orderBy('space.floorId', 'ASC')
            .addOrderBy('space.number', 'ASC')
            .getMany();
    }

    async delete(id: string): Promise<void> {
        const result = await this.repository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Space with ID ${id} not found`);
        }
    }

    async update(id: string, space: SpaceEntity): Promise<SpaceEntity> {
        await this.repository.save(space);
        const updated = await this.findById(id);
        if (!updated) {
            throw new NotFoundException(`Space with ID ${id} not found`);
        }
        return updated;
    }

    async updateStatus(id: string, status: string): Promise<SpaceEntity> {
        await this.repository.update(id, { status });
        return this.findById(id);
    }

    async updateCapacity(id: string, capacity: number): Promise<SpaceEntity> {
        await this.repository.update(id, { capacity });
        return this.findById(id);
    }

    async updateSurfaceArea(id: string, surfaceArea: number): Promise<SpaceEntity> {
        await this.repository.update(id, { surfaceArea });
        return this.findById(id);
    }

    async updateBabylonConfig(id: string, babylonConfig: Record<string, any>): Promise<SpaceEntity> {
        await this.repository.update(id, { babylonConfig });
        return this.findById(id);
    }

    async updateFeatures(id: string, features: Record<string, any>): Promise<SpaceEntity> {
        await this.repository.update(id, { features });
        return this.findById(id);
    }

    async updateType(id: string, type: SpaceType): Promise<SpaceEntity> {
        await this.repository.update(id, { type });
        return this.findById(id);
    }

    async updateFloorId(id: string, floorId: string): Promise<SpaceEntity> {
        await this.repository.update(id, { floorId });
        return this.findById(id);
    }

    async updateName(id: string, name: string): Promise<SpaceEntity> {
        await this.repository.update(id, { name });
        return this.findById(id);
    }

    async updateNumber(id: string, number: string): Promise<SpaceEntity> {
        await this.repository.update(id, { number });
        return this.findById(id);
    }

    async updateDescription(id: string, description: string): Promise<SpaceEntity> {
        const space = await this.findById(id);
        if (!space) throw new NotFoundException('Space not found');

        const updatedMetadata = {
            ...(space.metadata || {}),
            description
        };

        await this.repository.update(id, { metadata: updatedMetadata });
        return this.findById(id);
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