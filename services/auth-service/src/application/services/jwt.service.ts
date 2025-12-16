// src/application/services/jwt.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../dtos/jwt-payload.dto';
import { AuthUserEntity } from '../../domain/entities/auth-user.entity';
import { UserServiceClient } from './user-service-client.service';

/**
 * Service de gestion des tokens JWT
 * Génère des tokens contenant le rôle et le statut de l'utilisateur
 */
@Injectable()
export class JwtTokenService {
    private readonly logger = new Logger(JwtTokenService.name);
    private readonly accessTokenExpiration: string;
    private readonly refreshTokenExpiration: string;

    constructor(
        private readonly jwtService: NestJwtService,
        private readonly configService: ConfigService,
        private readonly userServiceClient: UserServiceClient,
    ) {
        this.accessTokenExpiration = this.configService.get<string>(
            'JWT_EXPIRATION',
            '2h',
        );
        this.refreshTokenExpiration = this.configService.get<string>(
            'JWT_REFRESH_EXPIRATION',
            '7d',
        );
    }

    /**
     * Génère un Access Token JWT avec rôle et statut
     * @param user - Entité AuthUser
     * @param sessionId - ID de la session
     * @returns Token JWT signé
     */
    async generateAccessToken(
        user: AuthUserEntity,
        sessionId: string,
    ): Promise<string> {
        try {
            // ✅ RÉCUPÉRER LE PROFIL COMPLET depuis User-Service
            this.logger.debug(`Generating access token for user ${user.id}`);
            
            const userProfile = await this.userServiceClient.getUserProfile(user.id);

            // ✅ PAYLOAD COMPLET avec ROLE + STATUS
            const payload: JwtPayload = {
                userId: user.id,
                email: user.email,
                sessionId: sessionId,
                role: userProfile.role,              // ✅ DEPUIS USER-SERVICE
                status: userProfile.status,          // ✅ DEPUIS USER-SERVICE
                typeUtilisateur: userProfile.role,   // ✅ ALIAS pour compatibilité CDC
            };

            const token = this.jwtService.sign(payload, {
                expiresIn: this.accessTokenExpiration,
                secret: this.configService.get<string>('JWT_SECRET'),
            });

            this.logger.debug(
                `✅ Access token generated for ${user.email} (${userProfile.role})`,
            );

            return token;
        } catch (error) {
            this.logger.error(
                `Failed to generate access token for user ${user.id}: ${error.message}`,
            );
            throw error;
        }
    }

    /**
     * Génère un Refresh Token JWT
     * @param userId - ID de l'utilisateur
     * @param sessionId - ID de la session
     * @returns Refresh token signé
     */
    generateRefreshToken(userId: string, sessionId: string): string {
        const payload = {
            userId,
            sessionId,
            type: 'refresh',
        };

        return this.jwtService.sign(payload, {
            expiresIn: this.refreshTokenExpiration,
            secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        });
    }

    /**
     * Vérifie et décode un token JWT
     * @param token - Token à vérifier
     * @returns Payload décodé
     */
    async verifyToken(token: string): Promise<JwtPayload> {
        try {
            return this.jwtService.verify(token, {
                secret: this.configService.get<string>('JWT_SECRET'),
            });
        } catch (error) {
            this.logger.error(`Token verification failed: ${error.message}`);
            throw new Error('Invalid or expired token');
        }
    }

    /**
     * Décode un token sans vérification (pour debug)
     * @param token - Token à décoder
     * @returns Payload décodé
     */
    decodeToken(token: string): JwtPayload | null {
        try {
            return this.jwtService.decode(token) as JwtPayload;
        } catch (error) {
            this.logger.error(`Token decoding failed: ${error.message}`);
            return null;
        }
    }
}