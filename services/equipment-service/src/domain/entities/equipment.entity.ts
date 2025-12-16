import { Entity, Column, ManyToOne, OneToMany, Index } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { EquipmentCategoryEntity } from './equipment-category.entity';
import { EquipmentTransferEntity } from './equipment-transfer.entity';
import { MaintenanceHistoryEntity } from './maintenance-history.entity';
import { EquipmentStatus } from '../enums/equipment-status.enum';
import { EquipmentCondition } from '../enums/equipment-condition.enum';

@Entity('equipments')
export class EquipmentEntity extends BaseEntity {
    @Column({ unique: true })
    code: string; // "LIT-006" (Généré par Factory)

    @Column()
    name: string; // "Lit IKEA Malm"

    @Column({ name: 'serial_number', nullable: true })
    serialNumber: string; // Numéro série fabricant (optionnel)

    // Soft Link vers Building-Service
    // On ne fait pas de relation TypeORM ici car c'est un autre microservice
    @Column({ name: 'space_id', type: 'uuid', nullable: true })
    @Index() // Indexé pour les recherches rapides "Qu'y a-t-il dans cette salle ?"
    spaceId: string;

    @Column({
        type: 'enum',
        enum: EquipmentStatus,
        default: EquipmentStatus.IN_STOCK
    })
    status: EquipmentStatus;

    @Column({
        type: 'enum',
        enum: EquipmentCondition,
        default: EquipmentCondition.NEW
    })
    condition: EquipmentCondition;

    @Column({ name: 'category_id' })
    categoryId: string;

    @ManyToOne(() => EquipmentCategoryEntity, (cat) => cat.equipments)
    category: EquipmentCategoryEntity;

    // Données financières / Achat
    @Column({ name: 'purchase_date', type: 'date', nullable: true })
    purchaseDate: Date;

    @Column({ name: 'purchase_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
    purchasePrice: number;

    @Column({ name: 'warranty_end_date', type: 'date', nullable: true })
    warrantyEndDate: Date;

    // Stockage images (Cloudinary)
    @Column({ type: 'jsonb', nullable: true, name: 'image_urls' })
    imageUrls: string[];

    // Métadonnées techniques (fiche technique)
    @Column({ type: 'jsonb', nullable: true })
    metadata: Record<string, any>;

    // Relations Historiques
    @OneToMany(() => EquipmentTransferEntity, (transfer) => transfer.equipment)
    transfers: EquipmentTransferEntity[];

    @OneToMany(() => MaintenanceHistoryEntity, (history) => history.equipment)
    maintenanceHistory: MaintenanceHistoryEntity[];
}