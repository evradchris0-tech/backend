"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeRoomAndSessionTypes1732980000000 = void 0;
class ChangeRoomAndSessionTypes1732980000000 {
    async up(queryRunner) {
        await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_users_current_room_id";
    `);
        await queryRunner.query(`
      ALTER TABLE "users" 
      ALTER COLUMN "current_room_id" TYPE varchar USING "current_room_id"::text;
    `);
        await queryRunner.query(`
      ALTER TABLE "users" 
      ALTER COLUMN "current_academic_session_id" TYPE varchar(9) USING "current_academic_session_id"::text;
    `);
        await queryRunner.query(`
      CREATE INDEX "IDX_users_current_room_id" 
      ON "users" ("current_room_id") 
      WHERE current_room_id IS NOT NULL;
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_users_current_room_id";
    `);
        await queryRunner.query(`
      ALTER TABLE "users" 
      ALTER COLUMN "current_room_id" TYPE uuid USING "current_room_id"::uuid;
    `);
        await queryRunner.query(`
      ALTER TABLE "users" 
      ALTER COLUMN "current_academic_session_id" TYPE uuid USING "current_academic_session_id"::uuid;
    `);
        await queryRunner.query(`
      CREATE INDEX "IDX_users_current_room_id" 
      ON "users" ("current_room_id") 
      WHERE current_room_id IS NOT NULL;
    `);
    }
}
exports.ChangeRoomAndSessionTypes1732980000000 = ChangeRoomAndSessionTypes1732980000000;
//# sourceMappingURL=1732980000000-ChangeRoomAndSessionTypes.js.map