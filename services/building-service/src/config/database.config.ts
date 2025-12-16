// services/building-service/src/config/database.config.ts

import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

ConfigModule.forRoot();

const databaseConfig: TypeOrmModuleOptions = {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5434'),
    username: process.env.DB_USERNAME || 'immo360_buildingdb',
    password: process.env.DB_PASSWORD || 'immo360MSBuilding',
    database: process.env.DB_DATABASE || 'immo360_building',

    // Entities auto-load
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],

    // Migrations
    migrations: [__dirname + '/../../database/migrations/*{.ts,.js}'],
    migrationsTableName: 'migrations_history',
    migrationsRun: false, // Manuel via CLI

    // Options
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    logging: process.env.DB_LOGGING === 'true',

    // Pool de connexions
    extra: {
        max: parseInt(process.env.DB_POOL_SIZE || '10'),
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    },

    // SSL (production)
    ssl: process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
};

export default databaseConfig;