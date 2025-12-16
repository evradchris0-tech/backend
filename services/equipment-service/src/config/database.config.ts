import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

ConfigModule.forRoot();

const databaseConfig: TypeOrmModuleOptions = {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5435'),
    username: process.env.DB_USERNAME || 'immo360_equipmentdb',
    password: process.env.DB_PASSWORD || 'immo360MSEquipment',
    database: process.env.DB_DATABASE || 'immo360_equipment',

    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../../database/migrations/*{.ts,.js}'],
    migrationsTableName: 'migrations_history',
    migrationsRun: false,

    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    logging: process.env.DB_LOGGING === 'true',

    extra: {
        max: parseInt(process.env.DB_POOL_SIZE || '10'),
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    },

    ssl: process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
};

export default databaseConfig;