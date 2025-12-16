// src/config/typeorm-cli.config.ts

import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { resolve } from 'path';

// Charger les variables d'environnement
config({ path: resolve(__dirname, '../../.env') });

/**
 * Configuration TypeORM CLI pour les migrations
 * Utilisé par les commandes npm run typeorm:migration:*
 */
export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'immo360_user',
    password: process.env.DB_PASSWORD || 'immo360MSAuth',
    database: process.env.DB_DATABASE || 'immo360_auth',

    // Entités
    entities: [resolve(__dirname, '../infrastructure/persistence/schemas/*.schema.{ts,js}')],

    // Migrations - ✅ CHEMIN CORRIGÉ
    migrations: [resolve(__dirname, '../infrastructure/persistence/migrations/*.{ts,js}')],

    // Options
    synchronize: false, // NE JAMAIS synchroniser via migrations
    logging: ['error', 'warn', 'migration'],

    migrationsTableName: 'typeorm_migrations',
});

export default AppDataSource;