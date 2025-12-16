import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { EquipmentCategoryEntity } from '../domain/entities/equipment-category.entity';
import { EquipmentEntity } from '../domain/entities/equipment.entity';
import { EquipmentTransferEntity } from '../domain/entities/equipment-transfer.entity';
import { MaintenanceHistoryEntity } from '../domain/entities/maintenance-history.entity';

// Repositories
import { TypeOrmEquipmentRepository } from './persistence/repositories/typeorm-equipment.repository';
import { TypeOrmEquipmentCategoryRepository } from './persistence/repositories/typeorm-equipment-category.repository';
import { TypeOrmTransferRepository } from './persistence/repositories/typeorm-transfer.repository';

// Factories
import { EquipmentFactory } from '../domain/factories/equipment.factory';

// Services
import { EquipmentService } from '../application/services/equipment.service';

// Controllers
import { EquipmentController } from './http/controllers/equipment.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            EquipmentCategoryEntity,
            EquipmentEntity,
            EquipmentTransferEntity,
            MaintenanceHistoryEntity
        ])
    ],
    controllers: [EquipmentController], // <--- Ajouté ici
    providers: [
        EquipmentService, // <--- Ajouté ici
        EquipmentFactory,
        {
            provide: 'IEquipmentRepository',
            useClass: TypeOrmEquipmentRepository,
        },
        {
            provide: 'IEquipmentCategoryRepository',
            useClass: TypeOrmEquipmentCategoryRepository,
        },
        {
            provide: 'ITransferRepository',
            useClass: TypeOrmTransferRepository,
        },
    ],
    exports: [EquipmentService, EquipmentFactory],
})
export class EquipmentModule { }