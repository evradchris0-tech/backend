import { Entity, Column, ManyToOne, OneToMany, Index } from 'typeorm';
import { BaseEntity } from '../../domain/base-entity';
import { SiteEntity } from './site.entity';
import { FloorEntity } from './floor.entity';
import { BuildingType } from '../enums/building-type.enum';

@Entity('buildings')
@Index(['siteId', 'code'], { unique: true })
export class BuildingEntity extends BaseEntity {
    @Column()
    siteId: string;

    @Column()
    name: string;

    @Column({ length: 50 })
    code: string; // Ex: "BAT-A"

    @Column({
        type: 'enum',
        enum: BuildingType,
        default: BuildingType.PEDAGOGICAL
    })
    type: BuildingType;

    @Column({ name: 'floors_count', type: 'int', default: 0 })
    floorsCount: number;

    @Column({ name: 'total_capacity', type: 'int', nullable: true })
    totalCapacity: number;

    @Column({ default: 'ACTIVE' })
    status: string;

    // Pour BabylonJS : Position et rotation globales du bâtiment dans le monde 3D
    @Column({ type: 'jsonb', nullable: true, name: 'location_data' })
    locationData: {
        x: number;
        y: number;
        z: number;
        rotation: number;
    };

    @Column({ type: 'jsonb', nullable: true })
    metadata: Record<string, any>;

    // Relations
    @ManyToOne(() => SiteEntity, (site) => site.buildings, { onDelete: 'CASCADE' })
    site: SiteEntity;

    @OneToMany(() => FloorEntity, (floor) => floor.building)
    floors: FloorEntity[];
}