"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddUserManagementColumns1732882800000 = void 0;
const typeorm_1 = require("typeorm");
class AddUserManagementColumns1732882800000 {
    async up(queryRunner) {
        await queryRunner.addColumn('users', new typeorm_1.TableColumn({
            name: 'first_name',
            type: 'varchar',
            isNullable: false,
            default: "''",
        }));
        await queryRunner.addColumn('users', new typeorm_1.TableColumn({
            name: 'last_name',
            type: 'varchar',
            isNullable: false,
            default: "''",
        }));
        await queryRunner.renameColumn('users', 'password_hash', 'password_encrypted');
        await queryRunner.changeColumn('users', 'password_encrypted', new typeorm_1.TableColumn({
            name: 'password_encrypted',
            type: 'text',
            isNullable: true,
        }));
        await queryRunner.query(`
      ALTER TYPE "users_role_enum" 
      ADD VALUE IF NOT EXISTS 'SUPERADMIN';
    `);
        await queryRunner.query(`
      ALTER TYPE "users_status_enum" 
      ADD VALUE IF NOT EXISTS 'PENDING_EMAIL_VERIFICATION';
    `);
        await queryRunner.addColumn('users', new typeorm_1.TableColumn({
            name: 'google_id',
            type: 'varchar',
            isNullable: true,
            isUnique: true,
        }));
        await queryRunner.addColumn('users', new typeorm_1.TableColumn({
            name: 'profile_picture',
            type: 'varchar',
            isNullable: true,
        }));
        await queryRunner.addColumn('users', new typeorm_1.TableColumn({
            name: 'email_verified',
            type: 'boolean',
            default: false,
        }));
        await queryRunner.addColumn('users', new typeorm_1.TableColumn({
            name: 'email_verification_code',
            type: 'varchar',
            length: '6',
            isNullable: true,
        }));
        await queryRunner.addColumn('users', new typeorm_1.TableColumn({
            name: 'email_verification_code_expires_at',
            type: 'timestamp',
            isNullable: true,
        }));
        await queryRunner.addColumn('users', new typeorm_1.TableColumn({
            name: 'username',
            type: 'varchar',
            isNullable: true,
            isUnique: true,
        }));
        await queryRunner.addColumn('users', new typeorm_1.TableColumn({
            name: 'current_room_id',
            type: 'uuid',
            isNullable: true,
        }));
        await queryRunner.addColumn('users', new typeorm_1.TableColumn({
            name: 'current_academic_session_id',
            type: 'uuid',
            isNullable: true,
        }));
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
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_current_room_id";`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_username";`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_google_id";`);
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
        await queryRunner.renameColumn('users', 'password_encrypted', 'password_hash');
    }
}
exports.AddUserManagementColumns1732882800000 = AddUserManagementColumns1732882800000;
//# sourceMappingURL=1732882800000-AddUserManagementColumns.js.map