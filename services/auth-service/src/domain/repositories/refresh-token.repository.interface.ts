// src/domain/repositories/refresh-token.repository.interface.ts

import { RefreshTokenEntity } from '../entities/refresh-token.entity';

export interface IRefreshTokenRepository {
    findById(id: string): Promise<RefreshTokenEntity | null>;
    findByToken(token: string): Promise<RefreshTokenEntity | null>;
    findByUserId(userId: string): Promise<RefreshTokenEntity[]>;
    save(refreshToken: RefreshTokenEntity): Promise<RefreshTokenEntity>;
    update(refreshToken: RefreshTokenEntity): Promise<RefreshTokenEntity>;
    delete(id: string): Promise<void>;
    revokeAllByUserId(userId: string): Promise<void>;
    deleteExpiredTokens(): Promise<number>;
}