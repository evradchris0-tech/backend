// common/strategies/jwt.strategy.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

/**
 * Interface du payload JWT
 */
export interface JwtPayload {
    userId: string;
    email: string;
    sessionId: string;
    role: string;
    status: string;
    typeUtilisateur: string;
    iat: number;
    exp: number;
}

/**
 * Strategy Passport JWT pour le User-Service
 * Valide les tokens JWT et extrait le payload
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
     * Valide le payload JWT et le retourne pour injection dans req.user
     */
    async validate(payload: JwtPayload): Promise<JwtPayload> {
        if (!payload.userId || !payload.email) {
            throw new UnauthorizedException('Invalid token payload');
        }

        if (!payload.role) {
            throw new UnauthorizedException('Invalid token: missing role');
        }

        if (payload.status !== 'ACTIVE') {
            throw new UnauthorizedException('Account is not active');
        }

        return payload;
    }
}