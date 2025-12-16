// migrations/1234567890-add-role-to-auth-users.ts

import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

/**
 * Migration: Ajout de la colonne 'role' dans auth_users
 * Permet de stocker le rôle synchronisé depuis User-Service
 */
export class AddRoleToAuthUsers1234567890 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Ajouter la colonne 'role'
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

        // Créer un index pour améliorer les performances des requêtes par rôle
        await queryRunner.query(`
            CREATE INDEX "IDX_auth_users_role" ON "auth_users" ("role");
        `);

        console.log('✅ Migration: Colonne "role" ajoutée à auth_users');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Supprimer l'index
        await queryRunner.query(`DROP INDEX "IDX_auth_users_role";`);

        // Supprimer la colonne
        await queryRunner.dropColumn('auth_users', 'role');

        console.log('✅ Rollback: Colonne "role" supprimée de auth_users');
    }
}