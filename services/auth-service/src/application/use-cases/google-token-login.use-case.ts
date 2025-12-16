// src/application/use-cases/google-token-login.use-case.ts

import {
    Injectable,
    Inject,
    UnauthorizedException,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import { IAuthUserRepository } from '../../domain/repositories/auth-user.repository.interface';
import { ISessionRepository } from '../../domain/repositories/session.repository.interface';
import { JwtTokenService } from '../services/jwt.service';
import { SessionManagerService } from '../services/session-manager.service';
import { GoogleTokenVerifierService } from '../services/google-token-verifier.service';
import { UserServiceClient } from '../services/user-service-client.service';
import { GoogleTokenLoginDto } from '../dtos/google-token-login.dto';
import { AuthResponseDto } from '../dtos/auth-response.dto';
import { AuthUserEntity, AuthUserStatus } from '../../domain/entities/auth-user.entity';

/**
 * Use Case: Login via Google Token avec récupération du profil complet
 */
@Injectable()
export class GoogleTokenLoginUseCase {
    private readonly logger = new Logger(GoogleTokenLoginUseCase.name);

    constructor(
        @Inject('IAuthUserRepository')
        private readonly authUserRepository: IAuthUserRepository,
        @Inject('ISessionRepository')
        private readonly sessionRepository: ISessionRepository,
        private readonly googleTokenVerifierService: GoogleTokenVerifierService,
        private readonly jwtTokenService: JwtTokenService,
        private readonly sessionManagerService: SessionManagerService,
        private readonly userServiceClient: UserServiceClient,
    ) {}

    async execute(
        googleTokenLoginDto: GoogleTokenLoginDto,
        ipAddress: string,
        userAgent: string,
    ): Promise<AuthResponseDto> {
        this.logger.log('Google token login attempt');

        // Vérifier le token Google
        const googlePayload = await this.googleTokenVerifierService.verifyIdToken(
            googleTokenLoginDto.idToken,
        );

        if (!googlePayload || !googlePayload.email) {
            throw new BadRequestException('Invalid Google token');
        }

        // Rechercher l'utilisateur par Google ID
        let authUser = await this.authUserRepository.findByGoogleId(
            googlePayload.sub,
        );

        // Si pas trouvé, chercher par email
        if (!authUser) {
            authUser = await this.authUserRepository.findByEmail(
                googlePayload.email,
            );

            // Si trouvé par email, lier le compte Google
            if (authUser) {
                authUser.linkGoogleAccount(googlePayload.sub);
                await this.authUserRepository.update(authUser);
                this.logger.log(
                    `Linked Google account to existing user: ${authUser.email}`,
                );
            }
        }

        // Si l'utilisateur n'existe pas du tout, créer un nouveau compte
        if (!authUser) {
            authUser = new AuthUserEntity(
                undefined,
                googlePayload.email,
                null, // Pas de mot de passe pour Google OAuth
                AuthUserStatus.ACTIVE,
                true, // Email déjà vérifié par Google
                0,
                null,
                null,
                googlePayload.sub,
                null, // Role sera synchronisé depuis User-Service
            );

            authUser = await this.authUserRepository.save(authUser);
            this.logger.log(`Created new user via Google: ${authUser.email}`);
        }

        // Vérifier que le compte n'est pas verrouillé
        if (authUser.isLocked()) {
            this.logger.warn(`Google login failed: account locked (${authUser.email})`);
            throw new UnauthorizedException(
                'Account is locked. Please contact support.',
            );
        }

        // ✅ RÉCUPÉRER LE PROFIL COMPLET depuis User-Service
        let userProfile;
        try {
            userProfile = await this.userServiceClient.getUserProfile(authUser.id);
        } catch (error) {
            this.logger.error(
                `Failed to retrieve user profile during Google login: ${error.message}`,
            );
            throw new UnauthorizedException(
                'Failed to retrieve user profile. Please contact support.',
            );
        }

        // Vérifier que le compte est actif
        if (userProfile.status !== 'ACTIVE') {
            this.logger.warn(
                `Google login failed: account not active (${authUser.email}, status: ${userProfile.status})`,
            );
            throw new UnauthorizedException(
                `Account is ${userProfile.status.toLowerCase()}. Please contact support.`,
            );
        }

        // Enregistrer le succès de connexion
        authUser.recordLoginSuccess();
        await this.authUserRepository.update(authUser);

        // Créer une nouvelle session
        const session = await this.sessionManagerService.createSession(
            authUser.id,
            ipAddress,
            userAgent,
        );
        const accessToken = await this.jwtTokenService.generateAccessToken(
            authUser,
            session.id,
        );

        const refreshToken = this.jwtTokenService.generateRefreshToken(
            authUser.id,
            session.id,
        );

        // Mettre à jour la session avec les tokens
        session.updateTokens(accessToken, refreshToken, session.expiresAt);
        await this.sessionRepository.update(session);

        this.logger.log(
            `✅ Google login successful: ${authUser.email} (${userProfile.role})`,
        );

        return {
            accessToken,
            refreshToken,
            sessionToken: session.id,
            expiresIn: 7200,
            user: {
                id: authUser.id,
                email: authUser.email,
                firstName: userProfile.firstName,
                lastName: userProfile.lastName,
                role: userProfile.role,
                status: userProfile.status,
                emailVerified: authUser.emailVerified,
            },
        };
    }
}