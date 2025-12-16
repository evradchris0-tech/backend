// src/application/use-cases/login.use-case.ts

import {
    Injectable,
    Inject,
    UnauthorizedException,
    Logger,
} from '@nestjs/common';
import { IAuthUserRepository } from '../../domain/repositories/auth-user.repository.interface';
import { ISessionRepository } from '../../domain/repositories/session.repository.interface';
import { PasswordService } from '../services/password.service';
import { JwtTokenService } from '../services/jwt.service';
import { SessionManagerService } from '../services/session-manager.service';
import { UserServiceClient } from '../services/user-service-client.service';
import { LoginDto } from '../dtos/login.dto';
import { AuthResponseWithProfile } from '../dtos/jwt-payload.dto';

/**
 * Use Case: Login avec récupération du profil complet
 * Conforme au cahier des charges Section II.1
 */
@Injectable()
export class LoginUseCase {
    private readonly logger = new Logger(LoginUseCase.name);

    constructor(
        @Inject('IAuthUserRepository')
        private readonly authUserRepository: IAuthUserRepository,
        @Inject('ISessionRepository')
        private readonly sessionRepository: ISessionRepository,
        private readonly passwordService: PasswordService,
        private readonly jwtTokenService: JwtTokenService,
        private readonly sessionManagerService: SessionManagerService,
        private readonly userServiceClient: UserServiceClient,
    ) {}

    async execute(
        loginDto: LoginDto,
        ipAddress: string,
        userAgent: string,
    ): Promise<AuthResponseWithProfile> {
        this.logger.log(`Login attempt for ${loginDto.email}`);

        // 1. Récupérer l'utilisateur par email
        const authUser = await this.authUserRepository.findByEmail(loginDto.email);
        if (!authUser) {
            this.logger.warn(`Login failed: user not found (${loginDto.email})`);
            throw new UnauthorizedException('Invalid credentials');
        }

        // 2. Vérifier si le compte est verrouillé
        if (authUser.isLocked()) {
            this.logger.warn(`Login failed: account locked (${loginDto.email})`);
            throw new UnauthorizedException(
                'Account is locked. Please try again later.',
            );
        }

        // 3. Vérifier le mot de passe
        const isPasswordValid = await this.passwordService.compare(
            loginDto.password,
            authUser.passwordEncrypted!,
        );

        if (!isPasswordValid) {
            authUser.recordLoginFailure();
            await this.authUserRepository.update(authUser);

            this.logger.warn(
                `Login failed: invalid password (${loginDto.email}, attempts: ${authUser.failedLoginAttempts})`,
            );

            throw new UnauthorizedException('Invalid credentials');
        }

        // 4. ✅ RÉCUPÉRER LE PROFIL COMPLET depuis User-Service
        let userProfile;
        try {
            userProfile = await this.userServiceClient.getUserProfile(authUser.id);
        } catch (error) {
            this.logger.error(
                `Failed to retrieve user profile during login: ${error.message}`,
            );
            throw new UnauthorizedException(
                'Failed to retrieve user profile. Please contact support.',
            );
        }

        // 5. Vérifier que le compte est actif
        if (userProfile.status !== 'ACTIVE') {
            this.logger.warn(
                `Login failed: account not active (${loginDto.email}, status: ${userProfile.status})`,
            );
            throw new UnauthorizedException(
                `Account is ${userProfile.status.toLowerCase()}. Please verify your email or contact support.`,
            );
        }

        // 6. Enregistrer le succès de connexion
        authUser.recordLoginSuccess();
        await this.authUserRepository.update(authUser);

        // 7. Créer une nouvelle session
        const expiresAt = new Date(Date.now() + 14400 * 1000); // 4 hours
        const refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
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

        // 9. Mettre à jour la session avec les tokens
        session.updateTokens(accessToken, refreshToken, session.expiresAt);
        await this.sessionRepository.update(session);

        this.logger.log(
            `✅ Login successful: ${loginDto.email} (${userProfile.role})`,
        );
        return {
            accessToken,
            refreshToken,
            sessionToken: session.id,
            expiresIn: 14400,
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