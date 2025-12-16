// src/application/use-cases/refresh-token.use-case.ts

import {
    Injectable,
    Inject,
    UnauthorizedException,
    NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { IAuthUserRepository } from '../../domain/repositories/auth-user.repository.interface';
import { ISessionRepository } from '../../domain/repositories/session.repository.interface';
import { IRefreshTokenRepository } from '../../domain/repositories/refresh-token.repository.interface';
import { JwtTokenService } from '../services/jwt.service';
import { SessionManagerService } from '../services/session-manager.service';
import { RefreshTokenDto } from '../dtos/refresh-token.dto';
import { AuthResponseDto } from '../dtos/auth-response.dto';
import { JwtPayload } from '../dtos/jwt-payload.dto';

@Injectable()
export class RefreshTokenUseCase {
    constructor(
        @Inject('IAuthUserRepository')
        private readonly authUserRepository: IAuthUserRepository,
        @Inject('ISessionRepository')
        private readonly sessionRepository: ISessionRepository,
        @Inject('IRefreshTokenRepository')
        private readonly refreshTokenRepository: IRefreshTokenRepository,
        private readonly jwtService: JwtTokenService,
        private readonly sessionManager: SessionManagerService,
    ) { }

    async execute(refreshTokenDto: RefreshTokenDto): Promise<AuthResponseDto> {
        // 1. Vérifier et décoder le refresh token
        let payload: JwtPayload;
        try {
            payload = this.jwtService.verifyRefreshToken(refreshTokenDto.refreshToken);
        } catch (error) {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }

        // 2. Vérifier que le refresh token existe en base
        const storedRefreshToken = await this.refreshTokenRepository.findByToken(
            refreshTokenDto.refreshToken,
        );

        if (!storedRefreshToken) {
            throw new UnauthorizedException('Refresh token not found');
        }

        if (storedRefreshToken.isRevoked) {
            throw new UnauthorizedException('Refresh token has been revoked');
        }

        if (storedRefreshToken.isExpired()) {
            throw new UnauthorizedException('Refresh token has expired');
        }

        // 3. Vérifier que l'utilisateur existe toujours dans auth_users
        const user = await this.authUserRepository.findById(payload.userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        // 4. Vérifier que le compte est toujours actif
        if (!user.isActive()) {
            throw new UnauthorizedException('Account is not active');
        }

        // 5. Récupérer la session associée
        const session = await this.sessionRepository.findById(
            storedRefreshToken.sessionId,
        );

        if (!session || session.isRevoked) {
            throw new UnauthorizedException('Session not found or revoked');
        }

        // 6. Générer de nouveaux tokens
        const newSessionId = uuidv4();
        const newJwtPayload: JwtPayload = {
            userId: user.id,
            email: user.email,
            sessionId: newSessionId,
        };

        const newAccessToken = this.jwtService.generateAccessToken(newJwtPayload);
        const newRefreshToken = this.jwtService.generateRefreshToken(newJwtPayload);
        const newAccessTokenExpiration = this.jwtService.getAccessTokenExpiration();
        const newRefreshTokenExpiration = this.jwtService.getRefreshTokenExpiration();

        // 7. Révoquer l'ancien refresh token
        storedRefreshToken.revoke();
        await this.refreshTokenRepository.update(storedRefreshToken);

        // 8. Mettre à jour la session
        session.updateTokens(newAccessToken, newRefreshToken, newAccessTokenExpiration);
        await this.sessionRepository.update(session);

        // 9. Créer un nouveau refresh token
        const newRefreshTokenEntity = this.sessionManager.createRefreshToken(
            user.id,
            newRefreshToken,
            newRefreshTokenExpiration,
            session.id,
        );
        await this.refreshTokenRepository.save(newRefreshTokenEntity);

        // 10. Retourner la réponse
        const expiresIn = Math.floor(
            (newAccessTokenExpiration.getTime() - Date.now()) / 1000,
        );

        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            sessionToken: session.id,
            expiresIn,
            user: {
                id: user.id,
                email: user.email,
            },
        };
    }
}