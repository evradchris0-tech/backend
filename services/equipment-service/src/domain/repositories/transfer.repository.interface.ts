import { EquipmentTransferEntity } from '../entities/equipment-transfer.entity';

export interface ITransferRepository {
    save(transfer: EquipmentTransferEntity): Promise<EquipmentTransferEntity>;

    // Historique des mouvements d'un équipement spécifique
    findByEquipmentId(equipmentId: string): Promise<EquipmentTransferEntity[]>;

    // Pour l'audit : mouvements récents
    findRecent(limit: number): Promise<EquipmentTransferEntity[]>;
}