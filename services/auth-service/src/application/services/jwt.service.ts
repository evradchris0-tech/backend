// src/application/services/jwt.service.ts

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { JwtPayload } from '../dtos/jwt-payload.dto';
import { normalizeJwtExpiration, normalizeRefreshTokenExpiration } from '../../config/jwt.config';

@Injectable()
export class JwtTokenService {
    private readonly accessTokenSecret: string;
    private readonly accessTokenExpiresIn: string;
    private readonly refreshTokenSecret: string;
    private readonly refreshTokenExpiresIn: string;

    constructor(
        private readonly jwtService: NestJwtService,
        private readonly configService: ConfigService,
    ) {
        this.accessTokenSecret = this.configService.get<string>('JWT_SECRET');
        this.accessTokenExpiresIn = normalizeJwtExpiration(this.configService);
        this.refreshTokenSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
        this.refreshTokenExpiresIn = normalizeRefreshTokenExpiration(this.configService);
    }

    generateAccessToken(payload: JwtPayload): string {
        return this.jwtService.sign(payload, {
            secret: this.accessTokenSecret,
            expiresIn: this.accessTokenExpiresIn,
        });
    }

    generateRefreshToken(payload: JwtPayload): string {
        return this.jwtService.sign(payload, {
            secret: this.refreshTokenSecret,
            expiresIn: this.refreshTokenExpiresIn,
        });
    }

    verifyAccessToken(token: string): JwtPayload {
        return this.jwtService.verify<JwtPayload>(token, {
            secret: this.accessTokenSecret,
        });
    }

    verifyRefreshToken(token: string): JwtPayload {
        return this.jwtService.verify<JwtPayload>(token, {
            secret: this.refreshTokenSecret,
        });
    }

    getAccessTokenExpiration(): Date {
        const expiresIn = this.parseExpiration(this.accessTokenExpiresIn);
        return new Date(Date.now() + expiresIn);
    }

    getRefreshTokenExpiration(): Date {
        const expiresIn = this.parseExpiration(this.refreshTokenExpiresIn);
        return new Date(Date.now() + expiresIn);
    }

    private parseExpiration(expiration: string): number {
        const unit = expiration.slice(-1);
        const value = parseInt(expiration.slice(0, -1), 10);

        switch (unit) {
            case 's':
                return value * 1000;
            case 'm':
                return value * 60 * 1000;
            case 'h':
                return value * 60 * 60 * 1000;
            case 'd':
                return value * 24 * 60 * 60 * 1000;
            default:
                return 3600000; // Default: 1 hour
        }
    }
}