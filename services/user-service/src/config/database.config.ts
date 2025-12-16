import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

ConfigModule.forRoot(); // Charger .env

const databaseConfig: TypeOrmModuleOptions = {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'immo360_userdb',
    password: process.env.DB_PASSWORD || 'immo360MSAuth',
    database: process.env.DB_DATABASE || 'immo360_user',
    entities: [__dirname + '/../**/*.schema{.ts,.js}'],
    synchronize: false,
    logging: true,
};

export default databaseConfig;