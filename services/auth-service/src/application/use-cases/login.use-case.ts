// src/application/use-cases/login.use-case.ts

import {
    Injectable,
    Inject,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { IAuthUserRepository } from '../../domain/repositories/auth-user.repository.interface';
import { ISessionRepository } from '../../domain/repositories/session.repository.interface';
import { IRefreshTokenRepository } from '../../domain/repositories/refresh-token.repository.interface';
import { PasswordService } from '../services/password.service';
import { JwtTokenService } from '../services/jwt.service';
import { SessionManagerService } from '../services/session-manager.service';
import { LoginDto } from '../dtos/login.dto';
import { AuthResponseDto } from '../dtos/auth-response.dto';

@Injectable()
export class LoginUseCase {
    constructor(
        @Inject('IAuthUserRepository')
        private readonly authUserRepository: IAuthUserRepository,
        @Inject('ISessionRepository')
        private readonly sessionRepository: ISessionRepository,
        @Inject('IRefreshTokenRepository')
        private readonly refreshTokenRepository: IRefreshTokenRepository,
        private readonly passwordService: PasswordService,
        private readonly jwtService: JwtTokenService,
        private readonly sessionManager: SessionManagerService,
        private readonly configService: ConfigService,
    ) { }

    async execute(
        loginDto: LoginDto,
        ipAddress: string,
        userAgent: string,
    ): Promise<AuthResponseDto> {
        // 1. Chercher l'utilisateur dans auth_users
        const user = await this.authUserRepository.findByEmail(loginDto.email);
        if (!user || !user.passwordEncrypted) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // 2. Vérifier si le compte est verrouillé
        if (user.isLocked()) {
            throw new UnauthorizedException('Account is locked. Please try again later.');
        }

        // 3. Vérifier si le compte est actif
        if (!user.isActive()) {
            throw new UnauthorizedException('Account is not active. Please verify your email.');
        }   

        // 4. Vérifier le mot de passe
        const isPasswordValid = await this.passwordService.compare(
            loginDto.password,
            user.passwordEncrypted,
        );

        if (!isPasswordValid) {
            user.recordLoginFailure();
            await this.authUserRepository.update(user);
            throw new UnauthorizedException('Invalid credentials');
        }

        // 5. Enregistrer la connexion réussie
        user.recordLoginSuccess();
        await this.authUserRepository.update(user);

        // 6. Créer une session JWT (SANS ROLE - auth-service ne connaît pas le role)
        const sessionId = uuidv4();
        const jwtPayload = {
            userId: user.id,
            email: user.email,
            sessionId,
        };

        const accessToken = this.jwtService.generateAccessToken(jwtPayload);
        const refreshToken = this.jwtService.generateRefreshToken(jwtPayload);
        const accessTokenExpiration = this.jwtService.getAccessTokenExpiration();
        const refreshTokenExpiration = this.jwtService.getRefreshTokenExpiration();

        // 7. Sauvegarder la session
        const session = this.sessionManager.createSession(
            user.id,
            accessToken,
            refreshToken,
            accessTokenExpiration,
            ipAddress,
            userAgent,
        );
        await this.sessionRepository.save(session);

        // 8. Sauvegarder le refresh token
        const refreshTokenEntity = this.sessionManager.createRefreshToken(
            user.id,
            refreshToken,
            refreshTokenExpiration,
            session.id,
        );
        await this.refreshTokenRepository.save(refreshTokenEntity);

        // 9. Retourner la réponse (SANS ROLE - le frontend appellera user-service pour le profil)
        const expiresIn = Math.floor(
            (accessTokenExpiration.getTime() - Date.now()) / 1000,
        );

        return {
            accessToken,
            refreshToken,
            sessionToken: session.id,
            expiresIn,
            user: {
                id: user.id,
                email: user.email,
            },
        };
    }
}