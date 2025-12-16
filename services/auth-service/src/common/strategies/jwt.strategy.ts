// src/common/strategies/jwt.strategy.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../../application/dtos/jwt-payload.dto';

/**
 * Stratégie JWT avec validation du rôle et du statut
 * Conforme au cahier des charges Section II.3.1
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET'),
        });
    }

    /**
     * Valide le payload JWT et vérifie la présence du rôle et du statut
     * @param payload - Payload JWT décodé
     * @returns Payload validé ou lève une exception
     */
    async validate(payload: JwtPayload): Promise<JwtPayload> {
        if (!payload.userId || !payload.email) {
            throw new UnauthorizedException('Invalid token payload: missing userId or email');
        }

        if (!payload.role) {
            throw new UnauthorizedException('Invalid token payload: missing role');
        }

        if (!payload.status) {
            throw new UnauthorizedException('Invalid token payload: missing status');
        }

        if (payload.status !== 'ACTIVE') {
            throw new UnauthorizedException(
                `Account is ${payload.status.toLowerCase()}. Please verify your email or contact support.`,
            );
        }
        return {
            userId: payload.userId,
            email: payload.email,
            sessionId: payload.sessionId,
            role: payload.role,
            status: payload.status,
            typeUtilisateur: payload.typeUtilisateur || payload.role,
        };
    }
}