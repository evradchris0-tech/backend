import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { EquipmentEntity } from './equipment.entity';

@Entity('equipment_transfers')
export class EquipmentTransferEntity extends BaseEntity {
    @Column({ name: 'equipment_id' })
    equipmentId: string;

    @ManyToOne(() => EquipmentEntity, (eq) => eq.transfers)
    equipment: EquipmentEntity;

    // UUID de l'espace de départ (null si neuf ou stock inconnu)
    @Column({ name: 'from_space_id', type: 'uuid', nullable: true })
    fromSpaceId: string;

    // UUID de l'espace d'arrivée
    @Column({ name: 'to_space_id', type: 'uuid', nullable: true })
    toSpaceId: string;

    // ID de l'utilisateur qui a fait le transfert (Agent)
    @Column({ name: 'performed_by', type: 'uuid' })
    performedBy: string;

    @Column({ type: 'text', nullable: true })
    reason: string; // "Installation initiale", "Déplacé pour maintenance"

    @Column({ name: 'transfer_date', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    transferDate: Date;
}