// src/infrastructure/persistence/schemas/user.schema.ts

import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { UserRole, UserStatus } from '../../../domain/entities/user.entity';

@Entity('users')
@Index(['email'], { unique: true })
@Index(['googleId'], { unique: true, where: 'google_id IS NOT NULL' })
@Index(['username'], { unique: true, where: 'username IS NOT NULL' })
export class UserSchema {

    @PrimaryColumn('varchar', { length: 255 })
    id: string;

    @Column({ unique: true })
    email: string;

    @Column({ name: 'first_name' })
    firstName: string;

    @Column({ name: 'last_name' })
    lastName: string;

    @Column({ name: 'password_encrypted', type: 'text', nullable: true })
    passwordEncrypted: string | null;

    @Column({
        type: 'enum',
        enum: Object.values(UserRole),
    })
    role: UserRole;

    @Column({
        type: 'enum',
        enum: Object.values(UserStatus),
        default: UserStatus.PENDING_EMAIL_VERIFICATION,
    })
    status: UserStatus;

    @Column({ name: 'google_id', nullable: true, unique: true })
    googleId: string | null;

    @Column({ name: 'profile_picture', nullable: true })
    profilePicture: string | null;

    @Column({ name: 'email_verified', default: false })
    emailVerified: boolean;

    @Column({ name: 'email_verification_code', nullable: true })
    emailVerificationCode: string | null;

    @Column({ name: 'email_verification_code_expires_at', type: 'timestamp', nullable: true })
    emailVerificationCodeExpiresAt: Date | null;

    @Column({ name: 'failed_login_attempts', default: 0 })
    failedLoginAttempts: number;

    @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
    lastLoginAt: Date | null;

    @Column({ name: 'locked_until', type: 'timestamp', nullable: true })
    lockedUntil: Date | null;

    @Column({ nullable: true, unique: true })
    username: string | null;

    @Column({ name: 'current_room_id', type: 'varchar', nullable: true })
    currentRoomId: string | null;

    @Column({ name: 'current_academic_session_id', type: 'varchar', length: 9, nullable: true })
    currentAcademicSessionId: string | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
