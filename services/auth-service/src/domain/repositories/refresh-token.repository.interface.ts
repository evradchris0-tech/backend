// src/domain/repositories/refresh-token.repository.interface.ts

import { RefreshTokenEntity } from '../entities/refresh-token.entity';

export interface IRefreshTokenRepository {
    findByToken(token: string): Promise<RefreshTokenEntity | null>;
    findByUserId(userId: string): Promise<RefreshTokenEntity[]>;
    save(refreshTokenEntity: RefreshTokenEntity): Promise<void>;
    update(refreshToken: RefreshTokenEntity): Promise<void>;
    deleteByUserId(userId: string): Promise<void>;
    revokeByUserId(userId: string): Promise<void>;
}