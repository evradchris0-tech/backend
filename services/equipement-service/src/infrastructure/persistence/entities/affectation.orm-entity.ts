import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { EquipementOrmEntity } from './equipement.orm-entity';

@Entity('affectations')
@Index(['equipementId', 'etat'])
@Index(['utilisateurBeneficiaire'])
@Index(['serviceBeneficiaire'])
@Index(['dateRetourPrevu'])
export class AffectationOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'equipement_id' })
  equipementId: string;

  @ManyToOne(() => EquipementOrmEntity, (equipement) => equipement.affectations, {
    nullable: false,
  })
  @JoinColumn({ name: 'equipement_id' })
  equipement: EquipementOrmEntity;

  @Column({ type: 'integer' })
  quantite: number;

  @Column({ type: 'varchar', length: 255, name: 'service_beneficiaire' })
  serviceBeneficiaire: string;

  @Column({ type: 'varchar', length: 255, name: 'utilisateur_beneficiaire' })
  utilisateurBeneficiaire: string;

  @Column({ type: 'timestamp', name: 'date_affectation' })
  dateAffectation: Date;

  @Column({ type: 'date', nullable: true, name: 'date_retour_prevu' })
  dateRetourPrevu: Date;

  @Column({ type: 'date', nullable: true, name: 'date_retour_effectif' })
  dateRetourEffectif: Date;

  @Column({ type: 'varchar', length: 50, default: 'ACTIVE' })
  etat: string;

  @Column({ type: 'text', nullable: true })
  observations: string;

  @Column({ type: 'text', nullable: true, name: 'motif_retrait' })
  motifRetrait: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
