// src/config/typeorm-cli.config.ts

import { DataSource } from 'typeorm';
import { config } from 'dotenv';

// Charger les variables d'environnement
config();

export default new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'immo360_users',
    entities: [__dirname + '/../infrastructure/persistence/schemas/*.schema{.ts,.js}'],
    migrations: [__dirname + '/../../database/migrations/*{.ts,.js}'],
    synchronize: false,
    logging: true,
});