// src/infrastructure/persistence/entities/espace.orm-entity.ts

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
import { TypeEspace } from '../../../domain/enums';
import { EtageOrmEntity } from './etage.orm-entity';
import { EquipementOrmEntity } from './equipement.orm-entity';

/**
 * Entite TypeORM pour la persistance des espaces
 * Mapping vers la table 'espaces'
 */
@Entity('espaces')
@Index(['etageId', 'numero'], { unique: true })
@Index(['etageId'])
@Index(['type'])
@Index(['estOccupe'])
@Index(['aEquipementDefectueux'])
@Index(['actif'])
@Index(['occupantId'])
export class EspaceOrmEntity {
    @PrimaryColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    etageId: string;

    @Column({ type: 'varchar', length: 50 })
    numero: string;

    @Column({
        type: 'enum',
        enum: TypeEspace,
    })
    type: TypeEspace;

    @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
    superficie: number | null;

    @Column({ type: 'int', nullable: true })
    capacite: number | null;

    @Column({ type: 'text', nullable: true })
    description: string | null;

    @Column({ type: 'boolean', default: false })
    estOccupe: boolean;

    @Column({ type: 'uuid', nullable: true })
    occupantId: string | null;

    @Column({ type: 'boolean', default: false })
    aEquipementDefectueux: boolean;

    @Column({ type: 'int', default: 0 })
    nombreEquipementsDefectueux: number;

    @Column({ type: 'boolean', default: true })
    actif: boolean;

    @CreateDateColumn({ type: 'timestamp with time zone' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp with time zone' })
    updatedAt: Date;

    // Relations
    @ManyToOne(() => EtageOrmEntity, etage => etage.espaces, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'etageId' })
    etage: EtageOrmEntity;

    @OneToMany(() => EquipementOrmEntity, equipement => equipement.espace)
    equipements: EquipementOrmEntity[];
}