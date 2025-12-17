// src/infrastructure/persistence/entities/equipement.orm-entity.ts

import {
    Entity,
    PrimaryColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { TypeEquipement, StatutEquipement } from '../../../domain/enums';
import { EspaceOrmEntity } from './espace.orm-entity';

/**
 * Structure de l'historique des statuts stockee en JSONB
 */
export interface HistoriqueStatutJson {
    ancienStatut: StatutEquipement | null;
    nouveauStatut: StatutEquipement;
    motif?: string;
    date: string; // ISO string
    utilisateurId?: string;
}

/**
 * Entite TypeORM pour la persistance des equipements
 * Mapping vers la table 'equipements'
 */
@Entity('equipements')
@Index(['numeroSerie'], { unique: true, where: '"numeroSerie" IS NOT NULL' })
@Index(['espaceId'])
@Index(['type'])
@Index(['statut'])
@Index(['actif'])
export class EquipementOrmEntity {
    @PrimaryColumn('uuid')
    id: string;

    @Column({
        type: 'enum',
        enum: TypeEquipement,
    })
    type: TypeEquipement;

    @Column({ type: 'varchar', length: 100, nullable: true })
    marque: string | null;

    @Column({ type: 'varchar', length: 100, nullable: true })
    modele: string | null;

    @Column({ type: 'varchar', length: 100, nullable: true, unique: true })
    numeroSerie: string | null;

    @Column({
        type: 'enum',
        enum: StatutEquipement,
        default: StatutEquipement.BON_ETAT,
    })
    statut: StatutEquipement;

    @Column({ type: 'uuid', nullable: true })
    espaceId: string | null;

    @Column({ type: 'date', nullable: true })
    dateAcquisition: Date | null;

    @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
    valeurAchat: number | null;

    @Column({ type: 'text', nullable: true })
    description: string | null;

    @Column({ type: 'int', default: 0 })
    historiquePannes: number;

    @Column({ type: 'timestamp with time zone', nullable: true })
    derniereDatePanne: Date | null;

    @Column({ type: 'date', nullable: true })
    dateInstallation: Date | null;

    @Column({ type: 'timestamp with time zone', nullable: true })
    dateDerniereIntervention: Date | null;

    @Column({
        type: 'jsonb',
        default: '[]',
    })
    historiqueStatuts: HistoriqueStatutJson[];

    @Column({ type: 'boolean', default: true })
    actif: boolean;

    @CreateDateColumn({ type: 'timestamp with time zone' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp with time zone' })
    updatedAt: Date;

    // Relations
    @ManyToOne(() => EspaceOrmEntity, espace => espace.equipements, {
        onDelete: 'SET NULL',
        nullable: true,
    })
    @JoinColumn({ name: 'espaceId' })
    espace: EspaceOrmEntity | null;
}