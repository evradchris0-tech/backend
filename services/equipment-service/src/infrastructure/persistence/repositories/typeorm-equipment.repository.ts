import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IEquipmentRepository } from '../../../domain/repositories/equipment.repository.interface';
import { EquipmentEntity } from '../../../domain/entities/equipment.entity';

@Injectable()
export class TypeOrmEquipmentRepository implements IEquipmentRepository {
    constructor(
        @InjectRepository(EquipmentEntity)
        private readonly repository: Repository<EquipmentEntity>,
    ) { }

    async save(equipment: EquipmentEntity): Promise<EquipmentEntity> {
        return this.repository.save(equipment);
    }

    async findById(id: string): Promise<EquipmentEntity | null> {
        return this.repository.findOne({
            where: { id },
            relations: ['category'] // Toujours utile d'avoir la catégorie
        });
    }

    async findByCode(code: string): Promise<EquipmentEntity | null> {
        return this.repository.findOne({ where: { code } });
    }

    async findBySpaceId(spaceId: string): Promise<EquipmentEntity[]> {
        return this.repository.find({
            where: { spaceId },
            relations: ['category'] // Pour afficher l'icône dans BabylonJS
        });
    }

    async findAll(options?: { skip: number; take: number }): Promise<EquipmentEntity[]> {
        return this.repository.find({
            skip: options?.skip,
            take: options?.take,
            order: { createdAt: 'DESC' },
            relations: ['category']
        });
    }
}