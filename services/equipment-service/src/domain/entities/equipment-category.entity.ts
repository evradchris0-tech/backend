import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { EquipmentEntity } from './equipment.entity';

@Entity('equipment_categories')
export class EquipmentCategoryEntity extends BaseEntity {
    @Column()
    name: string; // "Lit Simple", "Projecteur Vidéo"

    @Column({ unique: true })
    code: string; // "LIT", "PROJ" (Généré automatiquement)

    @Column({ type: 'text', nullable: true })
    description: string;

    // COMPTEUR CRITIQUE POUR LA FACTORY
    @Column({ name: 'last_sequence_number', type: 'int', default: 0 })
    lastSequenceNumber: number;

    @Column({ name: 'icon_url', nullable: true })
    iconUrl: string; // Icône pour l'UI (Cloudinary)

    @Column({ name: 'maintenance_interval', type: 'int', nullable: true })
    maintenanceInterval: number; // En jours (ex: 90 jours pour un filtre de clim)

    @Column({ default: 'MEDIUM' })
    criticality: string; // LOW, MEDIUM, HIGH, CRITICAL

    // Auto-référence pour sous-catégories (ex: Mobilier -> Lit)
    @Column({ name: 'parent_id', nullable: true })
    parentId: string;

    @ManyToOne(() => EquipmentCategoryEntity, (category) => category.children)
    @JoinColumn({ name: 'parent_id' })
    parent: EquipmentCategoryEntity;

    @OneToMany(() => EquipmentCategoryEntity, (category) => category.parent)
    children: EquipmentCategoryEntity[];

    @OneToMany(() => EquipmentEntity, (equipment) => equipment.category)
    equipments: EquipmentEntity[];
}