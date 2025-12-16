// src/application/use-cases/logout.use-case.ts

import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { ISessionRepository } from '../../domain/repositories/session.repository.interface';
import { IRefreshTokenRepository } from '../../domain/repositories/refresh-token.repository.interface';
import { LogoutDto } from '../dtos/logout.dto';

/**
 * Use Case: Déconnexion utilisateur
 * Révoque la session ET tous les refresh tokens de l'utilisateur
 */
@Injectable()
export class LogoutUseCase {
    constructor(
        @Inject('ISessionRepository')
        private readonly sessionRepository: ISessionRepository,
        @Inject('IRefreshTokenRepository')
        private readonly refreshTokenRepository: IRefreshTokenRepository,
    ) {}

    /**
     * ✅ MÉTHODE execute() OBLIGATOIRE
     * @param logoutDto - DTO contenant sessionId
     * @param userId - ID de l'utilisateur (extrait du JWT)
     */
    async execute(logoutDto: LogoutDto, userId: string): Promise<void> {
        const { sessionId } = logoutDto;

        // 1. Récupérer la session
        const session = await this.sessionRepository.findById(sessionId);

        if (!session) {
            throw new NotFoundException('Session not found');
        }

        // 2. Vérifier que la session appartient bien à l'utilisateur
        if (session.userId !== userId) {
            throw new NotFoundException('Session not found');
        }

        // 3. Terminer la session (met isActive=false, isRevoked=true)
        session.terminate();
        await this.sessionRepository.save(session);

        // 4. Révoquer TOUS les refresh tokens de l'utilisateur
        await this.refreshTokenRepository.revokeByUserId(userId);
    }
}