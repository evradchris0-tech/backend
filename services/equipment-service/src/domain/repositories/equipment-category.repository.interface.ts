import { EquipmentCategoryEntity } from '../entities/equipment-category.entity';

export interface IEquipmentCategoryRepository {
    findById(id: string): Promise<EquipmentCategoryEntity | null>;

    // Méthode critique : doit utiliser un verrou pessimiste (Pessimistic Write)
    // pour éviter que deux équipements créés en même temps aient le même numéro.
    incrementSequence(categoryId: string): Promise<number>;
}