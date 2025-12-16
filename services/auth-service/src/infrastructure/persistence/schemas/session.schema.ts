// src/infrastructure/persistence/schemas/session.schema.ts

import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
} from 'typeorm';

@Entity('sessions')
@Index(['userId'])
@Index(['isActive'])
export class SessionSchema {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id', type: 'uuid' })
    userId: string;

    @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
    ipAddress: string | null;

    @Column({ name: 'user_agent', type: 'text', nullable: true })
    userAgent: string | null;

    @Column({ name: 'expires_at', type: 'timestamp' })
    expiresAt: Date;

    @Column({ name: 'is_active', type: 'boolean', default: true }) // ✅ AJOUTER
    isActive: boolean;

    @Column({ name: 'is_revoked', type: 'boolean', default: false }) // ✅ AJOUTER si manquant
    isRevoked: boolean;

    @Column({ name: 'access_token', type: 'text', nullable: true })
    accessToken: string | null;

    @Column({ name: 'refresh_token', type: 'text', nullable: true })
    refreshToken: string | null;

    @Column({ name: 'last_activity_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }) // ✅ AJOUTER
    lastActivityAt: Date;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}