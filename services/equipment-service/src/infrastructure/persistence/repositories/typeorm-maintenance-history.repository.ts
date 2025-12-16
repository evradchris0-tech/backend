// services/equipment-service/src/infrastructure/persistence/repositories/typeorm-maintenance-history.repository.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MaintenanceHistoryEntity } from '../../../domain/entities/maintenance-history.entity';

export interface IMaintenanceHistoryRepository {
    save(history: MaintenanceHistoryEntity): Promise<MaintenanceHistoryEntity>;
    findByEquipmentId(equipmentId: string): Promise<MaintenanceHistoryEntity[]>;
    findByAgent(agentId: string): Promise<MaintenanceHistoryEntity[]>;
    findByPeriod(startDate: Date, endDate: Date): Promise<MaintenanceHistoryEntity[]>;
    getEquipmentMaintenanceStats(equipmentId: string): Promise<MaintenanceStats>;
}

export interface MaintenanceStats {
    totalMaintenances: number;
    totalCost: number;
    averageDuration: number;
    byType: Record<string, number>;
}

@Injectable()
export class TypeOrmMaintenanceHistoryRepository implements IMaintenanceHistoryRepository {
    constructor(
        @InjectRepository(MaintenanceHistoryEntity)
        private readonly repository: Repository<MaintenanceHistoryEntity>,
    ) { }

    async save(history: MaintenanceHistoryEntity): Promise<MaintenanceHistoryEntity> {
        return this.repository.save(history);
    }

    async findByEquipmentId(equipmentId: string): Promise<MaintenanceHistoryEntity[]> {
        return this.repository.find({
            where: { equipmentId },
            order: { performedAt: 'DESC' },
            relations: ['equipment'],
        });
    }

    async findByAgent(agentId: string): Promise<MaintenanceHistoryEntity[]> {
        return this.repository.find({
            where: { performedBy: agentId },
            order: { performedAt: 'DESC' },
            relations: ['equipment'],
        });
    }

    async findByPeriod(startDate: Date, endDate: Date): Promise<MaintenanceHistoryEntity[]> {
        return this.repository
            .createQueryBuilder('maintenance')
            .where('maintenance.performedAt BETWEEN :startDate AND :endDate', {
                startDate,
                endDate
            })
            .leftJoinAndSelect('maintenance.equipment', 'equipment')
            .orderBy('maintenance.performedAt', 'DESC')
            .getMany();
    }

    async getEquipmentMaintenanceStats(equipmentId: string): Promise<MaintenanceStats> {
        const result = await this.repository
            .createQueryBuilder('maintenance')
            .select('COUNT(*)', 'totalMaintenances')
            .addSelect('COALESCE(SUM(maintenance.cost), 0)', 'totalCost')
            .addSelect('COALESCE(AVG(maintenance.duration), 0)', 'averageDuration')
            .where('maintenance.equipmentId = :equipmentId', { equipmentId })
            .getRawOne();

        // Statistiques par type
        const byTypeResult = await this.repository
            .createQueryBuilder('maintenance')
            .select('maintenance.type', 'type')
            .addSelect('COUNT(*)', 'count')
            .where('maintenance.equipmentId = :equipmentId', { equipmentId })
            .groupBy('maintenance.type')
            .getRawMany();

        const byType: Record<string, number> = {};
        byTypeResult.forEach((row) => {
            byType[row.type] = parseInt(row.count, 10);
        });

        return {
            totalMaintenances: parseInt(result.totalMaintenances, 10),
            totalCost: parseFloat(result.totalCost),
            averageDuration: Math.round(parseFloat(result.averageDuration)),
            byType,
        };
    }


    async findByType(type: string): Promise<MaintenanceHistoryEntity[]> {
        return this.repository.find({
            where: { type },
            order: { performedAt: 'DESC' },
            relations: ['equipment'],
        });
    }

    async getGlobalStats(startDate?: Date, endDate?: Date): Promise<MaintenanceStats> {
        let query = this.repository.createQueryBuilder('maintenance');

        if (startDate && endDate) {
            query = query.where('maintenance.performedAt BETWEEN :startDate AND :endDate', {
                startDate,
                endDate,
            });
        }

        const result = await query
            .select('COUNT(*)', 'totalMaintenances')
            .addSelect('COALESCE(SUM(maintenance.cost), 0)', 'totalCost')
            .addSelect('COALESCE(AVG(maintenance.duration), 0)', 'averageDuration')
            .getRawOne();

        let byTypeQuery = this.repository.createQueryBuilder('maintenance');
        if (startDate && endDate) {
            byTypeQuery = byTypeQuery.where(
                'maintenance.performedAt BETWEEN :startDate AND :endDate',
                { startDate, endDate },
            );
        }

        const byTypeResult = await byTypeQuery
            .select('maintenance.type', 'type')
            .addSelect('COUNT(*)', 'count')
            .groupBy('maintenance.type')
            .getRawMany();

        const byType: Record<string, number> = {};
        byTypeResult.forEach((row) => {
            byType[row.type] = parseInt(row.count, 10);
        });

        return {
            totalMaintenances: parseInt(result.totalMaintenances, 10),
            totalCost: parseFloat(result.totalCost),
            averageDuration: Math.round(parseFloat(result.averageDuration)),
            byType,
        };
    }
}