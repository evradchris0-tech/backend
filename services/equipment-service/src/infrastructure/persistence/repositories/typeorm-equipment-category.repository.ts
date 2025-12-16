import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { IEquipmentCategoryRepository } from '../../../domain/repositories/equipment-category.repository.interface';
import { EquipmentCategoryEntity } from '../../../domain/entities/equipment-category.entity';

@Injectable()
export class TypeOrmEquipmentCategoryRepository implements IEquipmentCategoryRepository {
    constructor(
        @InjectRepository(EquipmentCategoryEntity)
        private readonly repository: Repository<EquipmentCategoryEntity>,
    ) { }

    async findById(id: string): Promise<EquipmentCategoryEntity | null> {
        return this.repository.findOne({ where: { id } });
    }

    /**
     * MÉTHODE CRITIQUE : Incrémentation atomique
     * Utilise un verrou pessimiste pour empêcher les "Race Conditions".
     */
    async incrementSequence(categoryId: string): Promise<number> {
        return this.repository.manager.transaction(async (transactionalEntityManager) => {
            // 1. SELECT ... FOR UPDATE
            // Cela verrouille la ligne jusqu'à la fin de la transaction
            const category = await transactionalEntityManager.findOne(EquipmentCategoryEntity, {
                where: { id: categoryId },
                lock: { mode: 'pessimistic_write' },
            });

            if (!category) {
                throw new Error(`Category with ID ${categoryId} not found during sequence increment.`);
            }

            // 2. Incrémentation
            const newSequence = category.lastSequenceNumber + 1;
            category.lastSequenceNumber = newSequence;

            // 3. Sauvegarde (Libère le verrou après commit)
            await transactionalEntityManager.save(category);

            return newSequence;
        });
    }
}