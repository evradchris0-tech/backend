// database/migrations/1733150000000-CreateUsersTables.ts

import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTables1733150000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Créer l'énumération des rôles
        await queryRunner.query(`
      CREATE TYPE user_role AS ENUM (
        'SUPERADMIN',
        'ADMINISTRATOR',
        'SUPERVISOR',
        'AGENT_TERRAIN',
        'OCCUPANT'
      );
    `);

        // Créer l'énumération des statuts
        await queryRunner.query(`
      CREATE TYPE user_status AS ENUM (
        'ACTIVE',
        'INACTIVE',
        'LOCKED',
        'PENDING_EMAIL_VERIFICATION'
      );
    `);

        // Créer la table users complète
        await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "email" varchar NOT NULL UNIQUE,
        "first_name" varchar NOT NULL,
        "last_name" varchar NOT NULL,
        "password_encrypted" text,
        "role" user_role NOT NULL,
        "status" user_status NOT NULL DEFAULT 'PENDING_EMAIL_VERIFICATION',
        "google_id" varchar UNIQUE,
        "profile_picture" varchar,
        "email_verified" boolean DEFAULT false,
        "email_verification_code" varchar(6),
        "email_verification_code_expires_at" timestamp,
        "failed_login_attempts" integer DEFAULT 0,
        "last_login_at" timestamp,
        "locked_until" timestamp,
        "username" varchar UNIQUE,
        "current_room_id" varchar,
        "current_academic_session_id" varchar(9),
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      );
    `);

        // Créer les index
        await queryRunner.query(`
      CREATE INDEX "IDX_users_email" ON "users" ("email");
    `);

        await queryRunner.query(`
      CREATE INDEX "IDX_users_google_id" ON "users" ("google_id") 
      WHERE google_id IS NOT NULL;
    `);

        await queryRunner.query(`
      CREATE INDEX "IDX_users_username" ON "users" ("username") 
      WHERE username IS NOT NULL;
    `);

        await queryRunner.query(`
      CREATE INDEX "IDX_users_current_room_id" ON "users" ("current_room_id") 
      WHERE current_room_id IS NOT NULL;
    `);

        await queryRunner.query(`
      CREATE INDEX "IDX_users_role" ON "users" ("role");
    `);

        await queryRunner.query(`
      CREATE INDEX "IDX_users_status" ON "users" ("status");
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "users";`);
        await queryRunner.query(`DROP TYPE "user_status";`);
        await queryRunner.query(`DROP TYPE "user_role";`);
    }
}