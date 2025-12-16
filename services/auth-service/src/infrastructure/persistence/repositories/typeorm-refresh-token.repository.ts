// src/infrastructure/persistence/repositories/typeorm-refresh-token.repository.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IRefreshTokenRepository } from '../../../domain/repositories/refresh-token.repository.interface';
import { RefreshTokenEntity } from '../../../domain/entities/refresh-token.entity';
import { RefreshTokenSchema } from '../schemas/refresh-token.schema';

@Injectable()
export class TypeOrmRefreshTokenRepository implements IRefreshTokenRepository {
    constructor(
        @InjectRepository(RefreshTokenSchema)
        private readonly refreshTokenRepository: Repository<RefreshTokenSchema>,
    ) {}

    async findByToken(token: string): Promise<RefreshTokenEntity | null> {
        const schema = await this.refreshTokenRepository.findOne({ where: { token } });
        return schema ? this.toDomain(schema) : null;
    }

    async findByUserId(userId: string): Promise<RefreshTokenEntity[]> {
        const schemas = await this.refreshTokenRepository.find({
            where: { userId, isRevoked: false },
            order: { createdAt: 'DESC' },
        });
        return schemas.map((schema) => this.toDomain(schema));
    }

    async save(refreshTokenEntity: RefreshTokenEntity): Promise<void> {
        const schema = this.toSchema(refreshTokenEntity);
        await this.refreshTokenRepository.save(schema);
    }

    async update(refreshToken: RefreshTokenEntity): Promise<void> {
        const schema = this.toSchema(refreshToken);
        await this.refreshTokenRepository.save(schema);
    }

    async deleteByUserId(userId: string): Promise<void> {
        await this.refreshTokenRepository.delete({ userId });
    }

    async revokeByUserId(userId: string): Promise<void> {
        await this.refreshTokenRepository.update(
            { userId, isRevoked: false },
            { isRevoked: true, revokedAt: new Date() }, // ✅ CORRECTION: revokedAt existe maintenant
        );
    }

    private toDomain(schema: RefreshTokenSchema): RefreshTokenEntity {
        return new RefreshTokenEntity(
            schema.id,
            schema.userId,
            schema.token,
            schema.expiresAt,
            schema.isRevoked,
            schema.revokedAt,
        );
    }

    private toSchema(entity: RefreshTokenEntity): RefreshTokenSchema {
        const schema = new RefreshTokenSchema();
        schema.id = entity.id;
        schema.userId = entity.userId;
        schema.token = entity.token;
        schema.expiresAt = entity.expiresAt;
        schema.isRevoked = entity.isRevoked;
        schema.revokedAt = entity.revokedAt;
        schema.createdAt = entity.createdAt;
        return schema;
    }
}