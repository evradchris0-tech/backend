// src/application/use-cases/google-token-login.use-case.ts

import {
    Injectable,
    Inject,
    UnauthorizedException,
    Logger,
    BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { IAuthUserRepository } from '../../domain/repositories/auth-user.repository.interface';
import { ISessionRepository } from '../../domain/repositories/session.repository.interface';
import { IRefreshTokenRepository } from '../../domain/repositories/refresh-token.repository.interface';
import { AuthUserEntity, AuthUserStatus } from '../../domain/entities/auth-user.entity';
import { GoogleTokenLoginDto } from '../dtos/google-token-login.dto';
import { AuthResponseDto } from '../dtos/auth-response.dto';
import { GoogleTokenVerifierService } from '../services/google-token-verifier.service';
import { JwtTokenService } from '../services/jwt.service';
import { SessionManagerService } from '../services/session-manager.service';

@Injectable()
export class GoogleTokenLoginUseCase {
    private readonly logger = new Logger(GoogleTokenLoginUseCase.name);

    constructor(
        @Inject('IAuthUserRepository')
        private readonly authUserRepository: IAuthUserRepository,
        @Inject('ISessionRepository')
        private readonly sessionRepository: ISessionRepository,
        @Inject('IRefreshTokenRepository')
        private readonly refreshTokenRepository: IRefreshTokenRepository,
        private readonly googleTokenVerifier: GoogleTokenVerifierService,
        private readonly jwtTokenService: JwtTokenService,
        private readonly sessionManagerService: SessionManagerService,
        private readonly configService: ConfigService,
    ) { }

    async execute(
        googleTokenLoginDto: GoogleTokenLoginDto,
        ipAddress: string,
        userAgent: string,
    ): Promise<AuthResponseDto> {
        this.logger.log('Google token login attempt');

        // 1. Vérifier et décoder le token Google
        const googlePayload = await this.googleTokenVerifier.verifyIdToken(
            googleTokenLoginDto.idToken,
        );

        if (!googlePayload.email_verified) {
            throw new BadRequestException('Email not verified by Google');
        }

        this.logger.log(`Google login for email: ${googlePayload.email}`);

        // 2. Chercher l'utilisateur existant
        const user = await this.authUserRepository.findByEmail(googlePayload.email);

        // 3. ✅ CORRIGÉ: Vérifier que l'utilisateur existe DÉJÀ
        if (!user) {
            this.logger.error(`No account found for email: ${googlePayload.email}`);
            throw new UnauthorizedException(
                'No account found. Please contact your administrator to create an account.',
            );
        }

        this.logger.log(`User found: ${user.email}`);

        // 4. ✅ CORRIGÉ: Vérifier que l'email est vérifié AVANT de lier Google ID
        // Cela protège contre le hijacking d'emails non vérifiés
        if (!user.emailVerified) {
            this.logger.warn(
                `Email not verified for user: ${user.email}. Cannot link Google account.`,
            );
            throw new UnauthorizedException(
                'Please verify your email address first before linking your Google account.',
            );
        }

        // 5. Vérifier le statut du compte
        if (user.status !== AuthUserStatus.ACTIVE) {
            this.logger.warn(`Account not active for email: ${user.email}, status: ${user.status}`);
            throw new UnauthorizedException('Account is not active');
        }

        // 6. Si l'utilisateur existe mais n'a pas de Google ID, l'ajouter
        if (googlePayload.sub && !(user as any).googleId) {
            (user as any).googleId = googlePayload.sub;
            await this.authUserRepository.update(user);
            this.logger.log(`Google ID linked to existing user: ${user.email}`);
        }

        // 7. Générer les tokens JWT
        const sessionId = uuidv4();

        const accessToken = this.jwtTokenService.generateAccessToken({
            userId: user.id,
            email: user.email,
            sessionId,
        });

        const refreshToken = this.jwtTokenService.generateRefreshToken({
            userId: user.id,
            email: user.email,
            sessionId,
        });

        // 8. Calculer l'expiration de la session (2 heures par défaut)
        const expiresInSeconds = 2 * 60 * 60; // 2 heures
        const sessionExpiresAt = new Date(Date.now() + expiresInSeconds * 1000);

        // 9. Créer une session
        const session = this.sessionManagerService.createSession(
            user.id,
            accessToken,
            refreshToken,
            sessionExpiresAt,
            ipAddress,
            userAgent,
        );

        await this.sessionRepository.save(session);
        this.logger.log(`Session created: ${session.id}`);

        // 10. Créer le refresh token entity
        const refreshTokenExpiresAt = new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 jours
        );

        const refreshTokenEntity = this.sessionManagerService.createRefreshToken(
            user.id,
            refreshToken,
            refreshTokenExpiresAt,
            session.id,
        );

        await this.refreshTokenRepository.save(refreshTokenEntity);
        this.logger.log(`Refresh token created for session: ${session.id}`);

        // 11. Retourner la réponse
        return {
            accessToken,
            refreshToken,
            sessionToken: session.id,
            expiresIn: expiresInSeconds,
            user: {
                id: user.id,
                email: user.email,
            },
        };
    }
}