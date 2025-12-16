import { Entity, Column, ManyToOne, Index } from 'typeorm';
import { BaseEntity } from '../../domain/base-entity';
import { FloorEntity } from './floor.entity';
import { SpaceType } from '../enums/space-type.enum';

@Entity('spaces')
@Index(['floorId', 'number'], { unique: true })
export class SpaceEntity extends BaseEntity {
    @Column()
    floorId: string;

    @Column({ name: 'building_id' })
    buildingId: string;

    @Column({ length: 50 })
    number: string; // "101", "A-12"

    @Column({ nullable: true })
    name: string;

    @Column({
        type: 'enum',
        enum: SpaceType,
        default: SpaceType.OTHER
    })
    type: SpaceType;

    @Column({ type: 'int', default: 1 })
    capacity: number;

    @Column({ name: 'surface_area', type: 'decimal', precision: 10, scale: 2, nullable: true })
    surfaceArea: number;

    @Column({ default: 'AVAILABLE' })
    status: string; // AVAILABLE, OCCUPIED, MAINTENANCE, OUT_OF_SERVICE

    // ==========================================
    // CONFIGURATION 3D (BabylonJS)
    // ==========================================
    @Column({ type: 'jsonb', nullable: true, name: 'babylon_config' })
    babylonConfig: {
        modelId?: string; // ID du modèle 3D générique (ex: "generic-bedroom-v1")
        dimensions?: { width: number; height: number; depth: number };
        position?: { x: number; y: number; z: number }; // Position relative sur l'étage
        rotation?: number;
        colorHex?: string; // Override couleur manuelle
    };

    @Column({ type: 'jsonb', nullable: true })
    features: {
        hasWindow: boolean;
        hasAC: boolean;
        hasRJ45: boolean;
        [key: string]: any;
    };

    // Relations
    @ManyToOne(() => FloorEntity, (floor) => floor.spaces, { onDelete: 'CASCADE' })
    floor: FloorEntity;
}