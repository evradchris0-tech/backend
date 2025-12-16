import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRoleToAuthUsers1765897010492 implements MigrationInterface {
    name = 'AddRoleToAuthUsers1765897010492'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."idx_verification_codes_code"`);
        await queryRunner.query(`DROP INDEX "public"."idx_verification_codes_email"`);
        await queryRunner.query(`DROP INDEX "public"."idx_verification_codes_expires_at"`);
        await queryRunner.query(`DROP INDEX "public"."idx_sessions_user_id"`);
        await queryRunner.query(`DROP INDEX "public"."idx_auth_users_email"`);
        await queryRunner.query(`DROP INDEX "public"."idx_auth_users_google_id"`);
        await queryRunner.query(`DROP INDEX "public"."idx_refresh_tokens_token"`);
        await queryRunner.query(`DROP INDEX "public"."idx_refresh_tokens_user_revoked"`);
        await queryRunner.query(`ALTER TABLE "auth_users" ADD "role" character varying(50)`);
        await queryRunner.query(`COMMENT ON COLUMN "auth_users"."role" IS 'Rôle synchronisé depuis User-Service via RabbitMQ'`);
        await queryRunner.query(`ALTER TABLE "verification_codes" ALTER COLUMN "type" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "verification_codes" ALTER COLUMN "created_at" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "ip_address"`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD "ip_address" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sessions" ALTER COLUMN "user_agent" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sessions" ALTER COLUMN "is_revoked" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sessions" ALTER COLUMN "last_activity_at" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sessions" ALTER COLUMN "created_at" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sessions" ALTER COLUMN "updated_at" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "auth_users" DROP CONSTRAINT "auth_users_email_key"`);
        await queryRunner.query(`ALTER TABLE "auth_users" DROP COLUMN "email"`);
        await queryRunner.query(`ALTER TABLE "auth_users" ADD "email" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "auth_users" ADD CONSTRAINT "UQ_13d8b49e55a8b06bee6bbc828fb" UNIQUE ("email")`);
        await queryRunner.query(`ALTER TABLE "auth_users" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "auth_users" ADD "status" character varying NOT NULL DEFAULT 'PENDING_EMAIL_VERIFICATION'`);
        await queryRunner.query(`ALTER TABLE "auth_users" ALTER COLUMN "email_verified" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "auth_users" ALTER COLUMN "failed_login_attempts" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "auth_users" ALTER COLUMN "created_at" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "auth_users" ALTER COLUMN "updated_at" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ALTER COLUMN "is_revoked" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ALTER COLUMN "created_at" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ALTER COLUMN "updated_at" SET NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_5796c1119fc1b0e93bed1c0c22" ON "verification_codes" ("expires_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_3b71b1fccadf73dc8d32517396" ON "verification_codes" ("email") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_bb0f37096d5704cf8424fbd922" ON "verification_codes" ("code") `);
        await queryRunner.query(`CREATE INDEX "IDX_085d540d9f418cfbdc7bd55bb1" ON "sessions" ("user_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_13d8b49e55a8b06bee6bbc828f" ON "auth_users" ("email") `);
        await queryRunner.query(`CREATE INDEX "IDX_14187aa4d2d58318c82c62c7ea" ON "refresh_tokens" ("user_id", "is_revoked") `);
        await queryRunner.query(`CREATE INDEX "IDX_4542dd2f38a61354a040ba9fd5" ON "refresh_tokens" ("token") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_4542dd2f38a61354a040ba9fd5"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_14187aa4d2d58318c82c62c7ea"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_13d8b49e55a8b06bee6bbc828f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_085d540d9f418cfbdc7bd55bb1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bb0f37096d5704cf8424fbd922"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3b71b1fccadf73dc8d32517396"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5796c1119fc1b0e93bed1c0c22"`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ALTER COLUMN "updated_at" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ALTER COLUMN "created_at" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ALTER COLUMN "is_revoked" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "auth_users" ALTER COLUMN "updated_at" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "auth_users" ALTER COLUMN "created_at" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "auth_users" ALTER COLUMN "failed_login_attempts" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "auth_users" ALTER COLUMN "email_verified" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "auth_users" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "auth_users" ADD "status" character varying(50) DEFAULT 'PENDING_EMAIL_VERIFICATION'`);
        await queryRunner.query(`ALTER TABLE "auth_users" DROP CONSTRAINT "UQ_13d8b49e55a8b06bee6bbc828fb"`);
        await queryRunner.query(`ALTER TABLE "auth_users" DROP COLUMN "email"`);
        await queryRunner.query(`ALTER TABLE "auth_users" ADD "email" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "auth_users" ADD CONSTRAINT "auth_users_email_key" UNIQUE ("email")`);
        await queryRunner.query(`ALTER TABLE "sessions" ALTER COLUMN "updated_at" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sessions" ALTER COLUMN "created_at" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sessions" ALTER COLUMN "last_activity_at" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sessions" ALTER COLUMN "is_revoked" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sessions" ALTER COLUMN "user_agent" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "ip_address"`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD "ip_address" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "verification_codes" ALTER COLUMN "created_at" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "verification_codes" ALTER COLUMN "type" DROP NOT NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "auth_users"."role" IS 'Rôle synchronisé depuis User-Service via RabbitMQ'`);
        await queryRunner.query(`ALTER TABLE "auth_users" DROP COLUMN "role"`);
        await queryRunner.query(`CREATE INDEX "idx_refresh_tokens_user_revoked" ON "refresh_tokens" ("is_revoked", "user_id") `);
        await queryRunner.query(`CREATE INDEX "idx_refresh_tokens_token" ON "refresh_tokens" ("token") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "idx_auth_users_google_id" ON "auth_users" ("google_id") WHERE (google_id IS NOT NULL)`);
        await queryRunner.query(`CREATE UNIQUE INDEX "idx_auth_users_email" ON "auth_users" ("email") `);
        await queryRunner.query(`CREATE INDEX "idx_sessions_user_id" ON "sessions" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "idx_verification_codes_expires_at" ON "verification_codes" ("expires_at") `);
        await queryRunner.query(`CREATE INDEX "idx_verification_codes_email" ON "verification_codes" ("email") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "idx_verification_codes_code" ON "verification_codes" ("code") `);
    }

}
