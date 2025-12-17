import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('fournisseurs')
@Index(['nom'])
export class FournisseurOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  nom: string;

  // Contact (embedded)
  @Column({ type: 'varchar', length: 20, name: 'contact_telephone' })
  contactTelephone: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'contact_email' })
  contactEmail: string;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'contact_telephone_secondaire' })
  contactTelephoneSecondaire: string;

  // Adresse (embedded)
  @Column({ type: 'varchar', length: 255, nullable: true, name: 'adresse_rue' })
  adresseRue: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'adresse_quartier' })
  adresseQuartier: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'adresse_ville' })
  adresseVille: string;

  @Column({ type: 'varchar', length: 100, default: 'Cameroun', name: 'adresse_pays' })
  adressePays: string;

  @Column({ type: 'text', nullable: true, name: 'conditions_paiement' })
  conditionsPaiement: string;

  @Column({ type: 'boolean', default: true, name: 'est_actif' })
  estActif: boolean;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
