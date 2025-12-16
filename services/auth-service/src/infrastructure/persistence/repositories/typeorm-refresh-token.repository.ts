// src/infrastructure/persistence/repositories/typeorm-refresh-token.repository.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { IRefreshTokenRepository } from '../../../domain/repositories/refresh-token.repository.interface';
import { RefreshTokenEntity } from '../../../domain/entities/refresh-token.entity';
import { RefreshTokenSchema } from '../schemas/refresh-token.schema';
import { RefreshTokenMapper } from '../../../application/mappers/refresh-token.mapper';

@Injectable()
export class TypeOrmRefreshTokenRepository implements IRefreshTokenRepository {
    constructor(
        @InjectRepository(RefreshTokenSchema)
        private readonly refreshTokenRepository: Repository<RefreshTokenSchema>,
    ) { }

    async findById(id: string): Promise<RefreshTokenEntity | null> {
        const schema = await this.refreshTokenRepository.findOne({ where: { id } });
        return schema ? RefreshTokenMapper.toDomain(schema) : null;
    }

    async findByToken(token: string): Promise<RefreshTokenEntity | null> {
        const schema = await this.refreshTokenRepository.findOne({ where: { token } });
        return schema ? RefreshTokenMapper.toDomain(schema) : null;
    }

    async findByUserId(userId: string): Promise<RefreshTokenEntity[]> {
        const schemas = await this.refreshTokenRepository.find({ where: { userId } });
        return schemas.map(RefreshTokenMapper.toDomain);
    }

    async save(refreshToken: RefreshTokenEntity): Promise<RefreshTokenEntity> {
        const schema = RefreshTokenMapper.toSchema(refreshToken);
        const saved = await this.refreshTokenRepository.save(schema);
        return RefreshTokenMapper.toDomain(saved);
    }

    async update(refreshToken: RefreshTokenEntity): Promise<RefreshTokenEntity> {
        const schema = RefreshTokenMapper.toSchema(refreshToken);
        await this.refreshTokenRepository.update(refreshToken.id, schema);
        const updated = await this.refreshTokenRepository.findOne({ where: { id: refreshToken.id } });
        return RefreshTokenMapper.toDomain(updated!);
    }

    async delete(id: string): Promise<void> {
        await this.refreshTokenRepository.delete(id);
    }

    async revokeAllByUserId(userId: string): Promise<void> {
        await this.refreshTokenRepository.update(
            { userId, isRevoked: false },
            { isRevoked: true },
        );
    }

    async deleteExpiredTokens(): Promise<number> {
        const result = await this.refreshTokenRepository.delete({
            expiresAt: LessThan(new Date()),
        });
        return result.affected || 0;
    }
}