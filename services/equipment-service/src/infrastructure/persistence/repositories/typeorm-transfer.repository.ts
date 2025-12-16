// services/equipment-service/src/infrastructure/persistence/repositories/typeorm-transfer.repository.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ITransferRepository } from '../../../domain/repositories/transfer.repository.interface';
import { EquipmentTransferEntity } from '../../../domain/entities/equipment-transfer.entity';

@Injectable()
export class TypeOrmTransferRepository implements ITransferRepository {
    constructor(
        @InjectRepository(EquipmentTransferEntity)
        private readonly repository: Repository<EquipmentTransferEntity>,
    ) { }

    async save(transfer: EquipmentTransferEntity): Promise<EquipmentTransferEntity> {
        return this.repository.save(transfer);
    }

    async findByEquipmentId(equipmentId: string): Promise<EquipmentTransferEntity[]> {
        return this.repository.find({
            where: { equipmentId },
            order: { transferDate: 'DESC' },
            relations: ['equipment'],
        });
    }

    async findRecent(limit: number): Promise<EquipmentTransferEntity[]> {
        return this.repository.find({
            order: { transferDate: 'DESC' },
            take: limit,
            relations: ['equipment'],
        });
    }

    async findByDateRange(startDate: Date, endDate: Date): Promise<EquipmentTransferEntity[]> {
        return this.repository
            .createQueryBuilder('transfer')
            .where('transfer.transferDate BETWEEN :startDate AND :endDate', {
                startDate,
                endDate
            })
            .leftJoinAndSelect('transfer.equipment', 'equipment')
            .orderBy('transfer.transferDate', 'DESC')
            .getMany();
    }

    async findByPerformedBy(userId: string): Promise<EquipmentTransferEntity[]> {
        return this.repository.find({
            where: { performedBy: userId },
            order: { transferDate: 'DESC' },
            relations: ['equipment'],
        });
    }

    async countByEquipment(equipmentId: string): Promise<number> {
        return this.repository.count({
            where: { equipmentId },
        });
    }
}