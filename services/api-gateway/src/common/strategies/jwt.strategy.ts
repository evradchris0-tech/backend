// src/common/strategies/jwt.strategy.ts

import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    private readonly logger = new Logger(JwtStrategy.name);

    constructor(private readonly configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('gateway.jwt.secret'),
        });
    }

    async validate(payload: JwtPayload): Promise<JwtPayload> {
        if (!payload.userId) {
            this.logger.warn('Token invalide: userId manquant');
            throw new UnauthorizedException('Token invalide');
        }

        if (!payload.role) {
            this.logger.warn('Token invalide: role manquant');
            throw new UnauthorizedException('Token invalide');
        }

        const validRoles = ['ADMINISTRATEUR', 'SUPERVISEUR', 'AGENT_TERRAIN', 'OCCUPANT'];
        if (!validRoles.includes(payload.role)) {
            this.logger.warn(`Role invalide: ${payload.role}`);
            throw new UnauthorizedException('Role invalide');
        }

        return payload;
    }
}
