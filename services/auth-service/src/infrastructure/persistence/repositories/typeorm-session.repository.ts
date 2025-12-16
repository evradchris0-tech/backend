// src/infrastructure/persistence/repositories/typeorm-session.repository.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ISessionRepository } from '../../../domain/repositories/session.repository.interface';
import { SessionEntity } from '../../../domain/entities/session.entity';
import { SessionSchema } from '../schemas/session.schema';

@Injectable()
export class TypeOrmSessionRepository implements ISessionRepository {
    constructor(
        @InjectRepository(SessionSchema)
        private readonly sessionRepository: Repository<SessionSchema>,
    ) { }
    findActiveByUserId(userId: string): Promise<SessionEntity[]> {
        throw new Error('Method not implemented.');
    }
    delete(id: string): Promise<void> {
        throw new Error('Method not implemented.');
    }
    terminateAllByUserId(userId: string): Promise<void> {
        throw new Error('Method not implemented.');
    }
    deleteExpiredSessions(): Promise<number> {
        throw new Error('Method not implemented.');
    }

    async findById(id: string): Promise<SessionEntity | null> {
        const schema = await this.sessionRepository.findOne({ where: { id } });
        return schema ? this.toDomain(schema) : null;
    }

    async findByUserId(userId: string): Promise<SessionEntity[]> {
        const schemas = await this.sessionRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
        return schemas.map((schema) => this.toDomain(schema));
    }

    async save(session: SessionEntity): Promise<SessionEntity> {
        const schema = this.toSchema(session);
        const savedSchema = await this.sessionRepository.save(schema);
        return this.toDomain(savedSchema);
    }

    async update(session: SessionEntity): Promise<SessionEntity> {
        const schema = this.toSchema(session);
        const updatedSchema = await this.sessionRepository.save(schema);
        return this.toDomain(updatedSchema);
    }


    async deleteById(id: string): Promise<void> {
        await this.sessionRepository.delete(id);
    }

    async deleteByUserId(userId: string): Promise<void> {
        await this.sessionRepository.delete({ userId });
    }

    private toDomain(schema: SessionSchema): SessionEntity {
        return new SessionEntity(
            schema.id,
            schema.userId,
            schema.ipAddress,
            schema.userAgent,
            schema.expiresAt,
            schema.isActive,
            schema.isRevoked,
            schema.accessToken,
            schema.refreshToken,
            schema.lastActivityAt,
        );
    }

    private toSchema(entity: SessionEntity): SessionSchema {
        const schema = new SessionSchema();
        schema.id = entity.id;
        schema.userId = entity.userId;
        schema.ipAddress = entity.ipAddress;
        schema.userAgent = entity.userAgent;
        schema.expiresAt = entity.expiresAt;
        schema.isActive = entity.isActive;
        schema.isRevoked = entity.isRevoked;
        schema.accessToken = entity.accessToken;
        schema.refreshToken = entity.refreshToken;
        schema.lastActivityAt = entity.lastActivityAt;
        schema.createdAt = entity.createdAt;
        schema.updatedAt = entity.updatedAt;
        return schema;
    }
}