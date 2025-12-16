// src/infrastructure/persistence/schemas/verification-code.schema.ts

import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('verification_codes')
@Index(['code'], { unique: true })
@Index(['email'])
@Index(['expiresAt'])
export class VerificationCodeSchema {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 10, unique: true })
    code: string;

    @Column({ type: 'varchar', length: 255 })
    email: string;

    @Column({
        type: 'varchar',
        length: 50,
        enum: ['EMAIL_VERIFICATION', 'PASSWORD_RESET'],
        default: 'EMAIL_VERIFICATION',
    })
    type: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET';

    @Column({ name: 'expires_at', type: 'timestamp' })
    expiresAt: Date;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
