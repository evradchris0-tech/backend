import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { EquipmentEntity } from './equipment.entity';

@Entity('maintenance_history')
export class MaintenanceHistoryEntity extends BaseEntity {
    @Column({ name: 'equipment_id' })
    equipmentId: string;

    @ManyToOne(() => EquipmentEntity, (eq) => eq.maintenanceHistory)
    equipment: EquipmentEntity;

    // ID de l'incident dans incident-service (pour lien externe)
    @Column({ name: 'incident_ref_id', type: 'uuid', nullable: true })
    incidentRefId: string;

    @Column()
    type: string; // PREVENTIVE, CORRECTIVE

    @Column({ type: 'text' })
    description: string; // "Remplacement du filtre", "Réparation pied cassé"

    @Column({ name: 'performed_at', type: 'timestamp' })
    performedAt: Date;

    @Column({ name: 'performed_by', type: 'uuid', nullable: true })
    performedBy: string; // ID Agent/Technicien

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    cost: number;
}