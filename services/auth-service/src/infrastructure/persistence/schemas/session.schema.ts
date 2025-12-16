// src/infrastructure/persistence/schemas/session.schema.ts

import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('sessions')
@Index(['userId'])
export class SessionSchema {
    @PrimaryColumn('uuid')
    id: string;

    @Column({ name: 'user_id', type: 'uuid' })
    userId: string;

    @Column({ name: 'access_token', type: 'text' })
    accessToken: string;

    @Column({ name: 'refresh_token', type: 'text' })
    refreshToken: string;

    @Column({ name: 'expires_at', type: 'timestamp' })
    expiresAt: Date;

    @Column({ name: 'ip_address', type: 'varchar' })
    ipAddress: string;

    @Column({ name: 'user_agent', type: 'text' })
    userAgent: string;

    @Column({ name: 'is_revoked', type: 'boolean', default: false })
    isRevoked: boolean;

    @Column({ name: 'last_activity_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    lastActivityAt: Date;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}