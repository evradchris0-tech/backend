// src/config/jwt.config.ts

import { JwtModuleOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

/**
 * Normalise les différentes variantes de noms de variables d'environnement JWT
 * Supporte : JWT_EXPIRES_IN, JWT_ACCESS_TOKEN_EXPIRATION, JWT_EXPIRATION
 */
export const normalizeJwtExpiration = (configService: ConfigService): string => {
    return (
        configService.get<string>('JWT_EXPIRES_IN') ||
        configService.get<string>('JWT_ACCESS_TOKEN_EXPIRATION') ||
        configService.get<string>('JWT_EXPIRATION') ||
        '2h' // Valeur par défaut
    );
};

export const normalizeRefreshTokenExpiration = (configService: ConfigService): string => {
    return (
        configService.get<string>('JWT_REFRESH_EXPIRES_IN') ||
        configService.get<string>('JWT_REFRESH_TOKEN_EXPIRATION') ||
        configService.get<string>('JWT_REFRESH_EXPIRATION') ||
        '7d' // Valeur par défaut
    );
};

export const getJwtConfig = (
    configService: ConfigService,
): JwtModuleOptions => ({
    secret: configService.get<string>('JWT_SECRET'),
    signOptions: {
        expiresIn: normalizeJwtExpiration(configService),
    },
});

/**
 * Configuration JWT complète pour injection dans les services
 */
export interface JwtConfiguration {
    accessTokenSecret: string;
    accessTokenExpiresIn: string;
    refreshTokenSecret: string;
    refreshTokenExpiresIn: string;
}

export const getFullJwtConfig = (configService: ConfigService): JwtConfiguration => ({
    accessTokenSecret: configService.get<string>('JWT_SECRET', 'default-secret-change-in-production'),
    accessTokenExpiresIn: normalizeJwtExpiration(configService),
    refreshTokenSecret: configService.get<string>('JWT_REFRESH_SECRET', 'default-refresh-secret'),
    refreshTokenExpiresIn: normalizeRefreshTokenExpiration(configService),
});