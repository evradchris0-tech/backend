// src/presentation/guards/jwt-auth.guard.ts

import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
    Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

/**
 * Interface pour le payload du token JWT
 */
interface JwtPayload {
    sub: string;
    email: string;
    role: string;
    iat: number;
    exp: number;
}

/**
 * Guard d'authentification JWT
 * Verifie la validite du token et extrait les informations utilisateur
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
    private readonly logger = new Logger(JwtAuthGuard.name);

    constructor(private readonly configService: ConfigService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);

        if (!token) {
            throw new UnauthorizedException('Token d\'authentification manquant');
        }

        try {
            const secret = this.configService.get<string>('JWT_SECRET', 'your-secret-key');
            const payload = jwt.verify(token, secret) as JwtPayload;

            // Attacher les informations utilisateur a la requete
            request.user = {
                userId: payload.sub,
                email: payload.email,
                role: payload.role,
            };

            return true;
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                throw new UnauthorizedException('Token expire');
            }
            if (error instanceof jwt.JsonWebTokenError) {
                throw new UnauthorizedException('Token invalide');
            }
            this.logger.error(`JWT verification failed: ${error.message}`);
            throw new UnauthorizedException('Authentification echouee');
        }
    }

    /**
     * Extrait le token du header Authorization
     */
    private extractTokenFromHeader(request: any): string | undefined {
        const authHeader = request.headers.authorization;
        if (!authHeader) {
            return undefined;
        }

        const [type, token] = authHeader.split(' ');
        return type === 'Bearer' ? token : undefined;
    }
}