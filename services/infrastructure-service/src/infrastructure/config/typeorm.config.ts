// src/infrastructure/config/typeorm.config.ts

import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import {
    BatimentOrmEntity,
    EtageOrmEntity,
    EspaceOrmEntity,
    EquipementOrmEntity,
} from '../persistence/entities';

/**
 * Configuration TypeORM pour PostgreSQL
 * Utilise les variables d'environnement pour la connexion
 */
export const getTypeOrmConfig = (configService: ConfigService): TypeOrmModuleOptions => {
    return {
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgres'),
        database: configService.get<string>('DB_DATABASE', 'infrastructure_db'),
        entities: [
            BatimentOrmEntity,
            EtageOrmEntity,
            EspaceOrmEntity,
            EquipementOrmEntity,
        ],
        synchronize: configService.get<string>('NODE_ENV') === 'development',
        logging: configService.get<string>('DB_LOGGING', 'false') === 'true',
        ssl: configService.get<string>('DB_SSL', 'false') === 'true'
            ? { rejectUnauthorized: false }
            : false,
        poolSize: configService.get<number>('DB_POOL_SIZE', 10),
        connectTimeoutMS: 10000,
        extra: {
            max: configService.get<number>('DB_POOL_SIZE', 10),
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 10000,
        },
    };
};

/**
 * Configuration TypeORM pour les migrations CLI
 */
export const typeOrmCliConfig: TypeOrmModuleOptions = {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'infrastructure_db',
    entities: ['src/infrastructure/persistence/entities/*.orm-entity.ts'],
    migrations: ['src/infrastructure/migrations/*.ts'],
    migrationsTableName: 'migrations',
    synchronize: false,
    logging: true,
};

export default typeOrmCliConfig;