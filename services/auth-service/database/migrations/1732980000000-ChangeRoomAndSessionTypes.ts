// database/migrations/1732980000000-ChangeRoomAndSessionTypes.ts

import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeRoomAndSessionTypes1732980000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Supprimer l'index existant sur current_room_id
        await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_users_current_room_id";
    `);

        // Modifier le type de current_room_id de UUID vers VARCHAR
        await queryRunner.query(`
      ALTER TABLE "users" 
      ALTER COLUMN "current_room_id" TYPE varchar USING "current_room_id"::text;
    `);

        // Modifier le type de current_academic_session_id de UUID vers VARCHAR(9)
        await queryRunner.query(`
      ALTER TABLE "users" 
      ALTER COLUMN "current_academic_session_id" TYPE varchar(9) USING "current_academic_session_id"::text;
    `);

        // Recréer l'index sur current_room_id
        await queryRunner.query(`
      CREATE INDEX "IDX_users_current_room_id" 
      ON "users" ("current_room_id") 
      WHERE current_room_id IS NOT NULL;
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Supprimer l'index
        await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_users_current_room_id";
    `);

        // Revenir à UUID (attention: perte de données si des VARCHAR non-UUID existent)
        await queryRunner.query(`
      ALTER TABLE "users" 
      ALTER COLUMN "current_room_id" TYPE uuid USING "current_room_id"::uuid;
    `);

        await queryRunner.query(`
      ALTER TABLE "users" 
      ALTER COLUMN "current_academic_session_id" TYPE uuid USING "current_academic_session_id"::uuid;
    `);

        // Recréer l'index
        await queryRunner.query(`
      CREATE INDEX "IDX_users_current_room_id" 
      ON "users" ("current_room_id") 
      WHERE current_room_id IS NOT NULL;
    `);
    }
}