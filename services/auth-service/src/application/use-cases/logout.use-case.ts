// src/application/use-cases/logout.use-case.ts

import { Injectable, Inject } from '@nestjs/common';
import { ISessionRepository } from '../../domain/repositories/session.repository.interface';
import { IRefreshTokenRepository } from '../../domain/repositories/refresh-token.repository.interface';

@Injectable()
export class LogoutUseCase {
    constructor(
        @Inject('ISessionRepository')
        private readonly sessionRepository: ISessionRepository,
        @Inject('IRefreshTokenRepository')
        private readonly refreshTokenRepository: IRefreshTokenRepository,
    ) { }

    async execute(sessionId: string): Promise<void> {
        // 1. Trouver la session
        const session = await this.sessionRepository.findById(sessionId);

        if (!session) {
            return; // Session déjà supprimée ou inexistante
        }
    
        // 2. Terminer la session
        session.terminate();
        await this.sessionRepository.update(session);

        // 3. Révoquer tous les refresh tokens de cette session
        const refreshTokens = await this.refreshTokenRepository.findByUserId(session.userId);

        for (const refreshToken of refreshTokens) {
            if (refreshToken.sessionId === sessionId) {
                refreshToken.revoke();
                await this.refreshTokenRepository.update(refreshToken);
            }
        }
    }
}