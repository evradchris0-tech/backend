// src/infrastructure/persistence/schemas/refresh-token.schema.ts

import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('refresh_tokens')
@Index(['userId'])
@Index(['token'])
export class RefreshTokenSchema {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id', type: 'uuid' })
    userId: string;

    @Column({ type: 'text', unique: true })
    token: string;

    @Column({ name: 'expires_at', type: 'timestamp' })
    expiresAt: Date;

    @Column({ name: 'is_revoked', type: 'boolean', default: false })
    isRevoked: boolean;

    @Column({ name: 'revoked_at', type: 'timestamp', nullable: true })
    revokedAt: Date | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}