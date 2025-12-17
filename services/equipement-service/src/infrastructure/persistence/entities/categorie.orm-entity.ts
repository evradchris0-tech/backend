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

@Entity('categories_equipement')
@Index(['code'], { unique: true })
export class CategorieOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 200 })
  libelle: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'uuid', nullable: true, name: 'categorie_parent_id' })
  categorieParentId: string;

  @ManyToOne(() => CategorieOrmEntity, (categorie) => categorie.enfants, {
    nullable: true,
  })
  @JoinColumn({ name: 'categorie_parent_id' })
  categorieParent: CategorieOrmEntity;

  @OneToMany(() => CategorieOrmEntity, (categorie) => categorie.categorieParent)
  enfants: CategorieOrmEntity[];

  @Column({ type: 'boolean', default: true, name: 'est_actif' })
  estActif: boolean;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
