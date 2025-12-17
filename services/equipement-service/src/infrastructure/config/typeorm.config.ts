import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import {
  EquipementOrmEntity,
  CategorieOrmEntity,
  FournisseurOrmEntity,
  MouvementStockOrmEntity,
  AffectationOrmEntity,
} from '../persistence/entities';

export const getTypeOrmConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get<string>('DB_HOST', 'localhost'),
  port: configService.get<number>('DB_PORT', 5432),
  username: configService.get<string>('DB_USERNAME', 'postgres'),
  password: configService.get<string>('DB_PASSWORD', 'postgres'),
  database: configService.get<string>('DB_DATABASE', 'immo360_equipement'),
  entities: [
    EquipementOrmEntity,
    CategorieOrmEntity,
    FournisseurOrmEntity,
    MouvementStockOrmEntity,
    AffectationOrmEntity,
  ],
  synchronize: configService.get<boolean>('DB_SYNCHRONIZE', false),
  logging: configService.get<boolean>('DB_LOGGING', false),
  migrations: ['dist/infrastructure/migrations/**/*.js'],
  migrationsRun: false,
  ssl: configService.get<boolean>('DB_SSL', false)
    ? {
        rejectUnauthorized: false,
      }
    : false,
});
