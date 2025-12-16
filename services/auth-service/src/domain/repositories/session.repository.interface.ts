// src/domain/repositories/session.repository.interface.ts

import { SessionEntity } from '../entities/session.entity';

export interface ISessionRepository {
    findById(id: string): Promise<SessionEntity | null>;
    findByUserId(userId: string): Promise<SessionEntity[]>;
    findActiveByUserId(userId: string): Promise<SessionEntity[]>;
    save(session: SessionEntity): Promise<SessionEntity>;
    update(session: SessionEntity): Promise<SessionEntity>;
    delete(id: string): Promise<void>;
    deleteByUserId(userId: string): Promise<void>;
    terminateAllByUserId(userId: string): Promise<void>;
    deleteExpiredSessions(): Promise<number>;
}