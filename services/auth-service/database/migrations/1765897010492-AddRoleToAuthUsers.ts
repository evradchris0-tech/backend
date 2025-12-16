// src/database/migrations/1765897010492-AddRoleToAuthUsers.ts

import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Migration: Ajout de la colonne 'role' dans auth_users
 * Permet de stocker le rôle synchronisé depuis User-Service
 */
export class AddRoleToAuthUsers1765897010492 implements MigrationInterface {
    name = 'AddRoleToAuthUsers1765897010492'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Ajouter la colonne 'role'
        await queryRunner.query(`
            ALTER TABLE "auth_users" 
            ADD "role" varchar(50)
        `);
        
        // Ajouter un commentaire sur la colonne (optionnel pour PostgreSQL)
        await queryRunner.query(`
            COMMENT ON COLUMN "auth_users"."role" IS 'Rôle synchronisé depuis User-Service via RabbitMQ'
        `);

        // Créer un index pour améliorer les performances
        await queryRunner.query(`
            CREATE INDEX "IDX_auth_users_role" ON "auth_users" ("role")
        `);

        console.log('✅ Migration: Colonne "role" ajoutée à auth_users');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Supprimer l'index
        await queryRunner.query(`DROP INDEX "public"."IDX_auth_users_role"`);
        
        // Supprimer la colonne
        await queryRunner.query(`ALTER TABLE "auth_users" DROP COLUMN "role"`);

        console.log('✅ Rollback: Colonne "role" supprimée de auth_users');
    }
}