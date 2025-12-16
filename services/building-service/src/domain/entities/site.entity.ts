import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../domain/base-entity';
import { BuildingEntity } from './building.entity';

@Entity('sites')
export class SiteEntity extends BaseEntity {
    @Column()
    name: string;

    @Column({ type: 'text', nullable: true })
    address: string;

    @Column({ length: 100, nullable: true })
    city: string;

    @Column({ length: 100, nullable: true })
    country: string;

    @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
    latitude: number;

    @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
    longitude: number;

    @Column({ default: 'ACTIVE' })
    status: string;

    // Relations
    @OneToMany(() => BuildingEntity, (building) => building.site)
    buildings: BuildingEntity[];
}