// src/application/use-cases/refresh-token.use-case.ts

import {
    Injectable,
    Inject,
    UnauthorizedException,
    Logger,
} from '@nestjs/common';
import { ISessionRepository } from '../../domain/repositories/session.repository.interface';
import { IRefreshTokenRepository } from '../../domain/repositories/refresh-token.repository.interface';
import { RefreshTokenEntity } from '../../domain/entities/refresh-token.entity';
import { JwtTokenService } from '../services/jwt.service';
import { UserServiceClient } from '../services/user-service-client.service';
import { RefreshTokenDto } from '../dtos/refresh-token.dto';
import { AuthResponseDto } from '../dtos/auth-response.dto';
import { JwtPayload } from '../dtos/jwt-payload.dto';

/**
 * Use Case: Refresh Token avec récupération du profil mis à jour
 */
@Injectable()
export class RefreshTokenUseCase {
    private readonly logger = new Logger(RefreshTokenUseCase.name);

    constructor(
        @Inject('ISessionRepository')
        private readonly sessionRepository: ISessionRepository,
        @Inject('IRefreshTokenRepository')
        private readonly refreshTokenRepository: IRefreshTokenRepository,
        private readonly jwtTokenService: JwtTokenService,
        private readonly userServiceClient: UserServiceClient,
    ) { }

    async execute(
        refreshTokenDto: RefreshTokenDto,
    ): Promise<AuthResponseDto> {
        this.logger.log('Refresh token request');

        let payload: JwtPayload;

        try {
            // ✅ CORRECTION: Utiliser verifyToken au lieu de verifyRefreshToken
            payload = await this.jwtTokenService.verifyToken(
                refreshTokenDto.refreshToken,
            );
        } catch (error) {
            this.logger.warn(`Invalid refresh token: ${error.message}`);
            throw new UnauthorizedException('Invalid or expired refresh token');
        }

        // Vérifier que le refresh token existe en base
        const refreshTokenEntity = await this.refreshTokenRepository.findByToken(
            refreshTokenDto.refreshToken,
        );

        if (!refreshTokenEntity) {
            this.logger.warn('Refresh token not found in database');
            throw new UnauthorizedException('Invalid refresh token');
        }

        // Vérifier que le token n'est pas révoqué
        if (refreshTokenEntity.isRevoked) {
            this.logger.warn(
                `Attempted to use revoked refresh token: ${refreshTokenEntity.id}`,
            );
            throw new UnauthorizedException('Refresh token has been revoked');
        }

        // Vérifier que le token n'est pas expiré
        if (refreshTokenEntity.isExpired()) {
            this.logger.warn(
                `Attempted to use expired refresh token: ${refreshTokenEntity.id}`,
            );
            throw new UnauthorizedException('Refresh token has expired');
        }

        // Vérifier que la session existe et est active
        const session = await this.sessionRepository.findById(payload.sessionId);

        if (!session || !session.isActive) {
            this.logger.warn(`Session not found or inactive: ${payload.sessionId}`);
            throw new UnauthorizedException('Session is no longer active');
        }

        // ✅ RÉCUPÉRER LE PROFIL À JOUR depuis User-Service
        let userProfile;
        try {
            userProfile = await this.userServiceClient.getUserProfile(payload.userId);
        } catch (error) {
            this.logger.error(
                `Failed to retrieve user profile during token refresh: ${error.message}`,
            );
            throw new UnauthorizedException(
                'Failed to retrieve user profile. Please login again.',
            );
        }

        // Vérifier que le compte est toujours actif
        if (userProfile.status !== 'ACTIVE') {
            this.logger.warn(
                `Token refresh failed: account not active (${userProfile.email}, status: ${userProfile.status})`,
            );
            throw new UnauthorizedException(
                `Account is ${userProfile.status.toLowerCase()}. Please contact support.`,
            );
        }

        // ✅ CONSTRUIRE UN AUTH_USER TEMPORAIRE pour generateAccessToken
        const authUser = {
            id: payload.userId,
            email: userProfile.email,
        };

        // ✅ GÉNÉRER DE NOUVEAUX TOKENS avec PROFIL MIS À JOUR (AWAIT)
        const newAccessToken = await this.jwtTokenService.generateAccessToken(
            authUser as any,
            session.id,
        );

        const newRefreshToken = this.jwtTokenService.generateRefreshToken(
            payload.userId,
            session.id,
        );

        // Calculer les expirations
        const newAccessTokenExpiration = new Date();
        newAccessTokenExpiration.setHours(newAccessTokenExpiration.getHours() + 2);

        const newRefreshTokenExpiration = new Date();
        newRefreshTokenExpiration.setDate(newRefreshTokenExpiration.getDate() + 7);

        // Mettre à jour la session
        session.updateTokens(
            newAccessToken,
            newRefreshToken,
            newAccessTokenExpiration,
        );
        await this.sessionRepository.update(session);

        // Révoquer l'ancien refresh token
        refreshTokenEntity.revoke();
        await this.refreshTokenRepository.update(refreshTokenEntity);

        // Sauvegarder le nouveau refresh token
        const newRefreshTokenEntity = new RefreshTokenEntity(
            undefined,
            payload.userId,
            newRefreshToken,
            newRefreshTokenExpiration,
            null,
            null,
        );
        await this.refreshTokenRepository.save(newRefreshTokenEntity);

        this.logger.log(`✅ Token refreshed for user: ${userProfile.email}`);

        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            sessionToken: session.id,
            expiresIn: 7200,
            user: {
                id: authUser.id,
                email: userProfile.email,
                firstName: userProfile.firstName,
                lastName: userProfile.lastName,
                role: userProfile.role,
                status: userProfile.status,
                emailVerified: userProfile.emailVerified,
            },
        };
    }
}