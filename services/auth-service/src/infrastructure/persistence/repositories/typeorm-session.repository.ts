// src/infrastructure/persistence/repositories/typeorm-session.repository.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { ISessionRepository } from '../../../domain/repositories/session.repository.interface';
import { SessionEntity } from '../../../domain/entities/session.entity';
import { SessionSchema } from '../schemas/session.schema';
import { SessionMapper } from '../../../application/mappers/session.mapper';

@Injectable()
export class TypeOrmSessionRepository implements ISessionRepository {
    constructor(
        @InjectRepository(SessionSchema)
        private readonly sessionRepository: Repository<SessionSchema>,
    ) { }

    async findById(id: string): Promise<SessionEntity | null> {
        const schema = await this.sessionRepository.findOne({ where: { id } });
        return schema ? SessionMapper.toDomain(schema) : null;
    }

    async findByUserId(userId: string): Promise<SessionEntity[]> {
        const schemas = await this.sessionRepository.find({
            where: { userId, isRevoked: false },
        });
        return schemas.map(SessionMapper.toDomain);
    }

    async findActiveByUserId(userId: string): Promise<SessionEntity[]> {
        const now = new Date();
        const schemas = await this.sessionRepository.find({
            where: {
                userId,
                isRevoked: false,
            },
        });

        // Filtrer les sessions non expirées
        const activeSessions = schemas.filter(
            (schema) => new Date(schema.expiresAt) > now
        );

        return activeSessions.map(SessionMapper.toDomain);
    }

    async save(session: SessionEntity): Promise<SessionEntity> {
        const schema = SessionMapper.toSchema(session);
        const saved = await this.sessionRepository.save(schema);
        return SessionMapper.toDomain(saved);
    }

    async update(session: SessionEntity): Promise<SessionEntity> {
        const schema = SessionMapper.toSchema(session);
        const updated = await this.sessionRepository.save(schema);
        return SessionMapper.toDomain(updated);
    }

    async delete(id: string): Promise<void> {
        await this.sessionRepository.delete(id);
    }

    async deleteByUserId(userId: string): Promise<void> {
        await this.sessionRepository.delete({ userId });
    }

    async terminateAllByUserId(userId: string): Promise<void> {
        await this.sessionRepository.update(
            { userId },
            { isRevoked: true }
        );
    }
    async deleteExpiredSessions(): Promise<number> {
        const now = new Date();
        const deleteResult = await this.sessionRepository.delete({
            expiresAt: LessThan(now),
        });
        return deleteResult.affected || 0;
    }
}