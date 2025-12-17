// src/infrastructure/persistence/entities/batiment.orm-entity.ts

import {
    Entity,
    PrimaryColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    Index,
} from 'typeorm';
import { TypeBatiment } from '../../../domain/enums';
import { EtageOrmEntity } from './etage.orm-entity';

/**
 * Entite TypeORM pour la persistance des batiments
 * Mapping vers la table 'batiments'
 */
@Entity('batiments')
@Index(['code'], { unique: true })
@Index(['type'])
@Index(['actif'])
export class BatimentOrmEntity {
    @PrimaryColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255 })
    nom: string;

    @Column({ type: 'varchar', length: 50, unique: true })
    code: string;

    @Column({
        type: 'enum',
        enum: TypeBatiment,
    })
    type: TypeBatiment;

    @Column({ type: 'varchar', length: 500, nullable: true })
    adresse: string | null;

    @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
    latitude: number | null;

    @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
    longitude: number | null;

    @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
    altitude: number | null;

    @Column({ type: 'int', default: 1 })
    nombreEtages: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    superficie: number | null;

    @Column({ type: 'date', nullable: true })
    dateConstruction: Date | null;

    @Column({ type: 'text', nullable: true })
    description: string | null;

    @Column({ type: 'varchar', length: 500, nullable: true })
    planBatiment: string | null;

    @Column({ type: 'boolean', default: true })
    actif: boolean;

    @CreateDateColumn({ type: 'timestamp with time zone' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp with time zone' })
    updatedAt: Date;

    // Relations
    @OneToMany(() => EtageOrmEntity, etage => etage.batiment)
    etages: EtageOrmEntity[];
}