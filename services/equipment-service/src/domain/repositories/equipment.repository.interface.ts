import { EquipmentEntity } from '../entities/equipment.entity';

export interface IEquipmentRepository {
    save(equipment: EquipmentEntity): Promise<EquipmentEntity>;
    findById(id: string): Promise<EquipmentEntity | null>;
    findByCode(code: string): Promise<EquipmentEntity | null>;

    // Pour afficher le contenu d'une salle (BabylonJS Sidebar)
    findBySpaceId(spaceId: string): Promise<EquipmentEntity[]>;

    // Recherche globale
    findAll(options?: { skip: number; take: number }): Promise<EquipmentEntity[]>;
}