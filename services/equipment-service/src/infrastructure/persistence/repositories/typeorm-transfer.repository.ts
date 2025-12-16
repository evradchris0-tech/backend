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
            order: { transferDate: 'DESC' }
        });
    }

    async findRecent(limit: number): Promise<EquipmentTransferEntity[]> {
        return this.repository.find({
            order: { transferDate: 'DESC' },
            take: limit,
            relations: ['equipment']
        });
    }
}