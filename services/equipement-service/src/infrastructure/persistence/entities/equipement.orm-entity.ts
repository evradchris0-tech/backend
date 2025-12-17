import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { CategorieOrmEntity } from './categorie.orm-entity';
import { FournisseurOrmEntity } from './fournisseur.orm-entity';
import { MouvementStockOrmEntity } from './mouvement-stock.orm-entity';
import { AffectationOrmEntity } from './affectation.orm-entity';

@Entity('equipements')
@Index(['reference'], { unique: true })
@Index(['numeroSerie'], { unique: true, where: 'numero_serie IS NOT NULL' })
export class EquipementOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  designation: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  reference: string;

  @Column({ type: 'uuid', name: 'categorie_id' })
  categorieId: string;

  @ManyToOne(() => CategorieOrmEntity, { nullable: false })
  @JoinColumn({ name: 'categorie_id' })
  categorie: CategorieOrmEntity;

  @Column({ type: 'varchar', length: 50, name: 'type_equipement' })
  typeEquipement: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  marque: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  modele: string;

  @Column({ type: 'varchar', length: 100, nullable: true, unique: true, name: 'numero_serie' })
  numeroSerie: string;

  @Column({ type: 'varchar', length: 50 })
  statut: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  qualite: string;

  @Column({ type: 'integer', name: 'quantite_stock', default: 0 })
  quantiteStock: number;

  @Column({ type: 'integer', name: 'quantite_minimale', default: 0 })
  quantiteMinimale: number;

  @Column({ type: 'integer', name: 'quantite_reservee', default: 0 })
  quantiteReservee: number;

  @Column({ type: 'varchar', length: 50 })
  unite: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'valeur_unitaire' })
  valeurUnitaire: number;

  @Column({ type: 'varchar', length: 10, default: 'FCFA' })
  devise: string;

  @Column({ type: 'date', nullable: true, name: 'date_acquisition' })
  dateAcquisition: Date;

  @Column({ type: 'integer', nullable: true, name: 'duree_vie_estimee' })
  dureeVieEstimee: number;

  @Column({ type: 'uuid', nullable: true, name: 'fournisseur_id' })
  fournisseurId: string;

  @ManyToOne(() => FournisseurOrmEntity, { nullable: true })
  @JoinColumn({ name: 'fournisseur_id' })
  fournisseur: FournisseurOrmEntity;

  @Column({ type: 'uuid', nullable: true, name: 'espace_stockage_id' })
  espaceStockageId: string;

  @Column({ type: 'text', nullable: true })
  observations: string;

  // Métadonnées (JSON)
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'metadata_poids' })
  metadataPoids: number;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'metadata_dimensions' })
  metadataDimensions: string;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'metadata_couleur' })
  metadataCouleur: string;

  @Column({ type: 'integer', nullable: true, name: 'metadata_garantie_mois' })
  metadataGarantieMois: number;

  @Column({ type: 'integer', default: 0, name: 'historique_pannes' })
  historiquePannes: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToMany(() => MouvementStockOrmEntity, (mouvement) => mouvement.equipement)
  mouvements: MouvementStockOrmEntity[];

  @OneToMany(() => AffectationOrmEntity, (affectation) => affectation.equipement)
  affectations: AffectationOrmEntity[];
}
