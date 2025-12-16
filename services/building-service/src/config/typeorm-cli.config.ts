// services/building-service/src/config/typeorm-cli.config.ts

import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

export default new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5434', 10),
    username: process.env.DB_USERNAME || 'immo360_buildingdb',
    password: process.env.DB_PASSWORD || 'immo360MSBuilding',
    database: process.env.DB_DATABASE || 'immo360_building',

    entities: [__dirname + '/../domain/entities/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../../database/migrations/*{.ts,.js}'],

    synchronize: false,
    logging: true,
});