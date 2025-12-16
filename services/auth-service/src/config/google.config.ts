// src/config/google.config.ts

import { ConfigService } from '@nestjs/config';

/**
 * Configuration Google OAuth 2.0
 */
export interface GoogleOAuthConfig {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    scopes: string[];
}

/**
 * Récupère la configuration Google OAuth depuis les variables d'environnement
 */
export const getGoogleConfig = (configService: ConfigService): GoogleOAuthConfig => {
    const clientId = configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET');
    const redirectUri = configService.get<string>('GOOGLE_REDIRECT_URI');

    if (!clientId || !clientSecret || !redirectUri) {
        throw new Error(
            'Google OAuth configuration incomplete. Required: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI',
        );
    }

    return {
        clientId,
        clientSecret,
        redirectUri,
        scopes: [
            'openid',
            'email',
            'profile',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
        ],
    };
};

/**
 * Vérifie si la configuration Google OAuth est valide
 */
export const isGoogleOAuthConfigured = (configService: ConfigService): boolean => {
    try {
        getGoogleConfig(configService);
        return true;
    } catch {
        return false;
    }
};

/**
 * URLs Google OAuth 2.0
 */
export const GOOGLE_OAUTH_URLS = {
    authorization: 'https://accounts.google.com/o/oauth2/v2/auth',
    token: 'https://oauth2.googleapis.com/token',
    userInfo: 'https://www.googleapis.com/oauth2/v2/userinfo',
    tokenInfo: 'https://oauth2.googleapis.com/tokeninfo',
} as const;