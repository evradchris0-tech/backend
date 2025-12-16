// database/migrations/1733152000000-CreateAuthUsersTable.ts

import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAuthUsersTable1733152000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Créer une nouvelle table auth_users (minimale)
        await queryRunner.query(`
      CREATE TABLE "auth_users" (
        "id" uuid PRIMARY KEY,
        "email" varchar NOT NULL UNIQUE,
        "password_encrypted" text,
        "status" varchar NOT NULL,
        "email_verified" boolean DEFAULT false,
        "failed_login_attempts" integer DEFAULT 0,
        "last_login_at" timestamp,
        "locked_until" timestamp,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      );
    `);

        // Copier les données de users vers auth_users
        await queryRunner.query(`
      INSERT INTO auth_users (
        id,
        email,
        password_encrypted,
        status,
        email_verified,
        failed_login_attempts,
        last_login_at,
        locked_until,
        created_at,
        updated_at
      )
      SELECT 
        id,
        email,
        password_encrypted,
        status,
        email_verified,
        failed_login_attempts,
        last_login_at,
        locked_until,
        created_at,
        updated_at
      FROM users;
    `);

        // Créer les index
        await queryRunner.query(`
      CREATE INDEX "IDX_auth_users_email" ON "auth_users" ("email");
    `);

        await queryRunner.query(`
      CREATE INDEX "IDX_auth_users_status" ON "auth_users" ("status");
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "auth_users";`);
    }
}