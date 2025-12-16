import { Entity, Column, ManyToOne, OneToMany, Index } from 'typeorm';
import { BaseEntity } from '../../domain/base-entity';
import { BuildingEntity } from './building.entity';
import { SpaceEntity } from './space.entity';

@Entity('floors')
@Index(['buildingId', 'number'], { unique: true })
export class FloorEntity extends BaseEntity {
    @Column()
    buildingId: string;

    @Column({ type: 'int' })
    number: number; // 0, 1, 2...

    @Column({ nullable: true })
    name: string; // "Rez-de-chaussée"

    @Column({ default: 'ACTIVE' })
    status: string;

    // Stockage Cloudinary : URL de l'image du plan
    @Column({ name: 'floor_plan_url', type: 'text', nullable: true })
    floorPlanUrl: string;

    // Relations
    @ManyToOne(() => BuildingEntity, (building) => building.floors, { onDelete: 'CASCADE' })
    building: BuildingEntity;

    @OneToMany(() => SpaceEntity, (space) => space.floor)
    spaces: SpaceEntity[];
}