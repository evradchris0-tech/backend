// src/infrastructure/persistence/schemas/refresh-token.schema.ts

import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('refresh_tokens')
@Index(['token'])
@Index(['userId', 'isRevoked'])
export class RefreshTokenSchema {
    @PrimaryColumn('uuid')
    id: string;

    @Column({ name: 'user_id', type: 'uuid' })
    userId: string;

    @Column({ type: 'text', unique: true })
    token: string;

    @Column({ name: 'expires_at', type: 'timestamp' })
    expiresAt: Date;

    @Column({ name: 'session_id', type: 'uuid' })
    sessionId: string;

    @Column({ name: 'is_revoked', default: false })
    isRevoked: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}