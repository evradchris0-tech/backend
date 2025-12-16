// src/infrastructure/persistence/schemas/auth-user.schema.ts

import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('auth_users')
@Index(['email'], { unique: true })
export class AuthUserSchema {
    @PrimaryColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column({ name: 'password_encrypted', type: 'text', nullable: true })
    passwordEncrypted: string | null;

    @Column({
        type: 'varchar',
        default: 'PENDING_EMAIL_VERIFICATION',
    })
    status: string;

    @Column({ name: 'email_verified', default: false })
    emailVerified: boolean;

    @Column({ name: 'failed_login_attempts', default: 0 })
    failedLoginAttempts: number;

    @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
    lastLoginAt: Date | null;

    @Column({ name: 'locked_until', type: 'timestamp', nullable: true })
    lockedUntil: Date | null;

    @Column({ name: 'google_id', type: 'varchar', length: 255, nullable: true, unique: true })
    googleId: string | null;

    @Column({
        name: 'role',
        type: 'varchar',
        length: 50,
        nullable: true,
        comment: 'Rôle synchronisé depuis User-Service via RabbitMQ'
    })
    role: string | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}