import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  EquipementOrmEntity,
  CategorieOrmEntity,
  FournisseurOrmEntity,
  MouvementStockOrmEntity,
  AffectationOrmEntity,
} from '../infrastructure/persistence/entities';
import {
  EquipementRepository,
  CategorieRepository,
} from '../infrastructure/persistence/repositories';

/**
 * Module de persistence - Gère TypeORM et les repositories
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      EquipementOrmEntity,
      CategorieOrmEntity,
      FournisseurOrmEntity,
      MouvementStockOrmEntity,
      AffectationOrmEntity,
    ]),
  ],
  providers: [
    {
      provide: 'IEquipementRepository',
      useClass: EquipementRepository,
    },
    {
      provide: 'ICategorieRepository',
      useClass: CategorieRepository,
    },
  ],
  exports: ['IEquipementRepository', 'ICategorieRepository'],
})
export class PersistenceModule {}
