// database/migrations/1732882800000-AddUserManagementColumns.ts

import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddUserManagementColumns1732882800000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Ajouter la colonne first_name
        await queryRunner.addColumn(
            'users',
            new TableColumn({
                name: 'first_name',
                type: 'varchar',
                isNullable: false,
                default: "''",
            }),
        );

        // Ajouter la colonne last_name
        await queryRunner.addColumn(
            'users',
            new TableColumn({
                name: 'last_name',
                type: 'varchar',
                isNullable: false,
                default: "''",
            }),
        );

        // Renommer password_hash en password_encrypted
        await queryRunner.renameColumn('users', 'password_hash', 'password_encrypted');

        // Modifier le type de password_encrypted pour accepter NULL
        await queryRunner.changeColumn(
            'users',
            'password_encrypted',
            new TableColumn({
                name: 'password_encrypted',
                type: 'text',
                isNullable: true,
            }),
        );

        // Ajouter SUPERADMIN à l'enum role
        await queryRunner.query(`
      ALTER TYPE "users_role_enum" 
      ADD VALUE IF NOT EXISTS 'SUPERADMIN';
    `);

        // Ajouter PENDING_EMAIL_VERIFICATION à l'enum status
        await queryRunner.query(`
      ALTER TYPE "users_status_enum" 
      ADD VALUE IF NOT EXISTS 'PENDING_EMAIL_VERIFICATION';
    `);

        // Ajouter google_id
        await queryRunner.addColumn(
            'users',
            new TableColumn({
                name: 'google_id',
                type: 'varchar',
                isNullable: true,
                isUnique: true,
            }),
        );

        // Ajouter profile_picture
        await queryRunner.addColumn(
            'users',
            new TableColumn({
                name: 'profile_picture',
                type: 'varchar',
                isNullable: true,
            }),
        );

        // Ajouter email_verified
        await queryRunner.addColumn(
            'users',
            new TableColumn({
                name: 'email_verified',
                type: 'boolean',
                default: false,
            }),
        );

        // Ajouter email_verification_code
        await queryRunner.addColumn(
            'users',
            new TableColumn({
                name: 'email_verification_code',
                type: 'varchar',
                length: '6',
                isNullable: true,
            }),
        );

        // Ajouter email_verification_code_expires_at
        await queryRunner.addColumn(
            'users',
            new TableColumn({
                name: 'email_verification_code_expires_at',
                type: 'timestamp',
                isNullable: true,
            }),
        );

        // Ajouter username (pour OCCUPANT)
        await queryRunner.addColumn(
            'users',
            new TableColumn({
                name: 'username',
                type: 'varchar',
                isNullable: true,
                isUnique: true,
            }),
        );

        // Ajouter current_room_id (pour OCCUPANT)
        await queryRunner.addColumn(
            'users',
            new TableColumn({
                name: 'current_room_id',
                type: 'uuid',
                isNullable: true,
            }),
        );

        // Ajouter current_academic_session_id (pour OCCUPANT)
        await queryRunner.addColumn(
            'users',
            new TableColumn({
                name: 'current_academic_session_id',
                type: 'uuid',
                isNullable: true,
            }),
        );

        // Créer des index pour améliorer les performances
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_users_google_id" 
      ON "users" ("google_id") 
      WHERE google_id IS NOT NULL;
    `);

        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_users_username" 
      ON "users" ("username") 
      WHERE username IS NOT NULL;
    `);

        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_users_current_room_id" 
      ON "users" ("current_room_id") 
      WHERE current_room_id IS NOT NULL;
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Supprimer les index
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_current_room_id";`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_username";`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_google_id";`);

        // Supprimer les colonnes (ordre inverse)
        await queryRunner.dropColumn('users', 'current_academic_session_id');
        await queryRunner.dropColumn('users', 'current_room_id');
        await queryRunner.dropColumn('users', 'username');
        await queryRunner.dropColumn('users', 'email_verification_code_expires_at');
        await queryRunner.dropColumn('users', 'email_verification_code');
        await queryRunner.dropColumn('users', 'email_verified');
        await queryRunner.dropColumn('users', 'profile_picture');
        await queryRunner.dropColumn('users', 'google_id');
        await queryRunner.dropColumn('users', 'last_name');
        await queryRunner.dropColumn('users', 'first_name');

        // Renommer password_encrypted en password_hash
        await queryRunner.renameColumn('users', 'password_encrypted', 'password_hash');

        // Note: Impossible de supprimer des valeurs d'enum en PostgreSQL
        // Les nouvelles valeurs SUPERADMIN et PENDING_EMAIL_VERIFICATION restent
    }
}