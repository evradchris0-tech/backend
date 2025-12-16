// database/migrations/1733151000000-MigrateUsersData.ts

import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrateUsersData1733151000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Se connecter à l'ancienne base immo360_auth pour copier les données
        await queryRunner.query(`
      INSERT INTO users (
        id,
        email,
        first_name,
        last_name,
        password_encrypted,
        role,
        status,
        google_id,
        profile_picture,
        email_verified,
        email_verification_code,
        email_verification_code_expires_at,
        failed_login_attempts,
        last_login_at,
        locked_until,
        username,
        current_room_id,
        current_academic_session_id,
        created_at,
        updated_at
      )
      SELECT 
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.password_encrypted,
        u.role::text::user_role,
        u.status::text::user_status,
        u.google_id,
        u.profile_picture,
        u.email_verified,
        u.email_verification_code,
        u.email_verification_code_expires_at,
        u.failed_login_attempts,
        u.last_login_at,
        u.locked_until,
        u.username,
        u.current_room_id,
        u.current_academic_session_id,
        u.created_at,
        u.updated_at
      FROM dblink(
        'host=localhost port=5432 dbname=immo360_auth user=postgres password=postgres',
        'SELECT 
          id,
          email,
          first_name,
          last_name,
          password_encrypted,
          role,
          status,
          google_id,
          profile_picture,
          email_verified,
          email_verification_code,
          email_verification_code_expires_at,
          failed_login_attempts,
          last_login_at,
          locked_until,
          username,
          current_room_id,
          current_academic_session_id,
          created_at,
          updated_at
        FROM users'
      ) AS u(
        id uuid,
        email varchar,
        first_name varchar,
        last_name varchar,
        password_encrypted text,
        role varchar,
        status varchar,
        google_id varchar,
        profile_picture varchar,
        email_verified boolean,
        email_verification_code varchar,
        email_verification_code_expires_at timestamp,
        failed_login_attempts integer,
        last_login_at timestamp,
        locked_until timestamp,
        username varchar,
        current_room_id varchar,
        current_academic_session_id varchar,
        created_at timestamp,
        updated_at timestamp
      );
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`TRUNCATE TABLE "users";`);
    }
}