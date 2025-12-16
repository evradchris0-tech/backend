// src/infrastructure/persistence/migrations/1734361234567-AddRoleToAuthUsers.ts

import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

/**
 * Migration: Ajout de la colonne 'role' dans auth_users
 * Permet de stocker le rôle synchronisé depuis User-Service
 */
export class AddRoleToAuthUsers1734361234567 implements MigrationInterface {
    name = 'AddRoleToAuthUsers1734361234567';

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('🔄 Running migration: AddRoleToAuthUsers...');

        // 1. Ajouter la colonne 'role'
        await queryRunner.addColumn(
            'auth_users',
            new TableColumn({
                name: 'role',
                type: 'varchar',
                length: '50',
                isNullable: true,
                comment: 'Rôle synchronisé depuis User-Service via RabbitMQ',
            }),
        );

        // 2. Créer un index pour améliorer les performances
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_auth_users_role" 
            ON "auth_users" ("role");
        `);

        console.log('✅ Migration completed: Colonne "role" ajoutée à auth_users');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.log('🔄 Reverting migration: AddRoleToAuthUsers...');

        // 1. Supprimer l'index
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_auth_users_role";`);

        // 2. Supprimer la colonne
        await queryRunner.dropColumn('auth_users', 'role');

        console.log('✅ Rollback completed: Colonne "role" supprimée de auth_users');
    }
}