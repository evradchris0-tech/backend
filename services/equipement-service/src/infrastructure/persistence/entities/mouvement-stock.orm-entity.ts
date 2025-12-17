import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { EquipementOrmEntity } from './equipement.orm-entity';

@Entity('mouvements_stock')
@Index(['equipementId', 'createdAt'])
@Index(['typeMouvement'])
@Index(['utilisateurId'])
export class MouvementStockOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'equipement_id' })
  equipementId: string;

  @ManyToOne(() => EquipementOrmEntity, (equipement) => equipement.mouvements, {
    nullable: false,
  })
  @JoinColumn({ name: 'equipement_id' })
  equipement: EquipementOrmEntity;

  @Column({ type: 'varchar', length: 50, name: 'type_mouvement' })
  typeMouvement: string;

  @Column({ type: 'integer' })
  quantite: number;

  @Column({ type: 'integer', name: 'quantite_avant' })
  quantiteAvant: number;

  @Column({ type: 'integer', name: 'quantite_apres' })
  quantiteApres: number;

  @Column({ type: 'varchar', length: 255 })
  motif: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  reference: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  livreur: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'service_destination' })
  serviceDestination: string;

  @Column({ type: 'uuid', name: 'utilisateur_id' })
  utilisateurId: string;

  @Column({ type: 'date', nullable: true, name: 'date_retrait' })
  dateRetrait: Date;

  @Column({ type: 'date', nullable: true, name: 'date_reception' })
  dateReception: Date;

  // Facture (embedded)
  @Column({ type: 'varchar', length: 100, nullable: true, name: 'facture_numero' })
  factureNumero: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true, name: 'facture_montant' })
  factureMontant: number;

  @Column({ type: 'varchar', length: 10, nullable: true, name: 'facture_devise' })
  factureDevise: string;

  @Column({ type: 'date', nullable: true, name: 'facture_date' })
  factureDate: Date;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'facture_fichier_url' })
  factureFichierUrl: string;

  @Column({ type: 'text', nullable: true })
  observations: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
