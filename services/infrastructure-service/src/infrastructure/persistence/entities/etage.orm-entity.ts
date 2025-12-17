// src/infrastructure/persistence/entities/etage.orm-entity.ts

import {
    Entity,
    PrimaryColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
    Index,
} from 'typeorm';
import { BatimentOrmEntity } from './batiment.orm-entity';
import { EspaceOrmEntity } from './espace.orm-entity';

/**
 * Entite TypeORM pour la persistance des etages
 * Mapping vers la table 'etages'
 */
@Entity('etages')
@Index(['batimentId', 'numero'], { unique: true })
@Index(['batimentId'])
@Index(['actif'])
export class EtageOrmEntity {
    @PrimaryColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    batimentId: string;

    @Column({ type: 'int' })
    numero: number;

    @Column({ type: 'varchar', length: 100 })
    designation: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    superficie: number | null;

    @Column({ type: 'varchar', length: 500, nullable: true })
    planEtage: string | null;

    @Column({ type: 'boolean', default: true })
    actif: boolean;

    @CreateDateColumn({ type: 'timestamp with time zone' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp with time zone' })
    updatedAt: Date;

    // Relations
    @ManyToOne(() => BatimentOrmEntity, batiment => batiment.etages, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'batimentId' })
    batiment: BatimentOrmEntity;

    @OneToMany(() => EspaceOrmEntity, espace => espace.etage)
    espaces: EspaceOrmEntity[];
}