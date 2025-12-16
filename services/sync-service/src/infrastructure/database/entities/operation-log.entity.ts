import {
    Entity,
    PrimaryColumn,
    Column,
    CreateDateColumn,
    Index,
    ManyToOne,
    JoinColumn,
} from 'typeorm';

@Entity('operation_logs')
@Index(['timestamp'])
@Index(['status'])
@Index(['entityId'])
@Index(['eventId'])
@Index(['sourceService'])
@Index(['operationType'])
@Index(['entityType', 'entityId'])
@Index(['status', 'timestamp'])
export class OperationLogEntity {
    @PrimaryColumn('uuid')
    id: string;

    @Column('uuid')
    eventId: string;

    @Column()
    eventType: string; // 'user.created', 'user.updated', 'user.deleted'

    @Column()
    operationType: 'CREATED' | 'UPDATED' | 'DELETED' | 'SYNCED' | 'FAILED' | 'RETRIED';

    @Column()
    sourceService: string; // 'user-service'

    @Column('simple-array')
    targetServices: string[]; // ['auth-service', 'room-service']

    @Column()
    entityType: string; // 'USER'

    @Column()
    entityId: string;

    @Column()
    status: 'SUCCESS' | 'FAILED' | 'PENDING';

    @Column('integer')
    duration: number; // ms

    @Column({ nullable: true })
    errorMessage?: string;

    @Column('integer', { default: 0 })
    retryCount: number;

    @CreateDateColumn()
    createdAt: Date;

    @Column()
    timestamp: Date; // Timestamp original de l'opération

    @Column({ nullable: true })
    userId?: string; // ID utilisateur affecté

    @Column('jsonb', { nullable: true })
    metadata?: Record<string, any>;

    // Traçabilité complémentaire
    @Column({ nullable: true })
    ipAddress?: string;

    @Column({ nullable: true })
    userAgent?: string;

    @Column({ nullable: true })
    traceId?: string; // Correlation ID pour end-to-end tracing

    @Column('boolean', { default: false })
    isSyncedToRedis: boolean; // Indicateur de cache
}
