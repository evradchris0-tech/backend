// src/application/services/google-oauth.service.ts

import { Injectable, Logger, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface GoogleTokenResponse {
    access_token: string;
    expires_in: number;
    refresh_token?: string;
    scope: string;
    token_type: string;
    id_token: string;
}

export interface GoogleUserInfo {
    id: string;
    email: string;
    verified_email: boolean;
    name: string;
    given_name: string;
    family_name: string;
    picture: string;
    locale: string;
}

@Injectable()
export class GoogleOAuthService {
    private readonly logger = new Logger(GoogleOAuthService.name);
    private readonly clientId: string;
    private readonly clientSecret: string;
    private readonly redirectUri: string;
    private readonly authorizationUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    private readonly tokenUrl = 'https://oauth2.googleapis.com/token';
    private readonly userInfoUrl = 'https://www.googleapis.com/oauth2/v2/userinfo';

    constructor(private readonly configService: ConfigService) {
        this.clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
        this.clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
        this.redirectUri = this.configService.get<string>('GOOGLE_REDIRECT_URI');

        if (!this.clientId || !this.clientSecret || !this.redirectUri) {
            this.logger.error('Google OAuth credentials are not properly configured');
            throw new Error('Google OAuth configuration is incomplete');
        }

        this.logger.log('Google OAuth Service initialized');
        this.logger.debug(`Client ID: ${this.clientId}`);
        this.logger.debug(`Redirect URI: ${this.redirectUri}`);
    }

    /**
     * Génère l'URL d'autorisation Google OAuth 2.0
     */
    getAuthorizationUrl(state?: string): string {
        const params = new URLSearchParams({
            client_id: this.clientId,
            redirect_uri: this.redirectUri,
            response_type: 'code',
            scope: [
                'openid',
                'email',
                'profile',
                'https://www.googleapis.com/auth/userinfo.email',
                'https://www.googleapis.com/auth/userinfo.profile',
            ].join(' '),
            access_type: 'offline', // Pour obtenir refresh_token
            prompt: 'consent', // Force l'affichage du consentement pour obtenir refresh_token
            include_granted_scopes: 'true',
        });

        if (state) {
            params.append('state', state);
        }

        const url = `${this.authorizationUrl}?${params.toString()}`;
        this.logger.debug(`Generated authorization URL: ${url}`);
        return url;
    }

    /**
     * Échange le code d'autorisation contre les tokens Google
     */
    async exchangeCodeForTokens(code: string): Promise<GoogleTokenResponse> {
        this.logger.log('Exchanging authorization code for tokens');

        try {
            const response = await fetch(this.tokenUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    code,
                    client_id: this.clientId,
                    client_secret: this.clientSecret,
                    redirect_uri: this.redirectUri,
                    grant_type: 'authorization_code',
                }).toString(),
            });

            if (!response.ok) {
                const errorData = await response.json();
                this.logger.error('Failed to exchange code for tokens', errorData);
                throw new BadRequestException(
                    `Google token exchange failed: ${errorData.error_description || errorData.error}`,
                );
            }

            const tokens: GoogleTokenResponse = await response.json();

            this.logger.log('Successfully exchanged code for tokens');
            this.logger.debug(`Token type: ${tokens.token_type}`);
            this.logger.debug(`Expires in: ${tokens.expires_in}s`);
            this.logger.debug(`Has refresh token: ${!!tokens.refresh_token}`);

            if (!tokens.id_token) {
                throw new BadRequestException('No id_token received from Google');
            }

            return tokens;
        } catch (error) {
            this.logger.error('Error exchanging code for tokens', error.message);
            throw error;
        }
    }

    /**
     * Récupère les informations utilisateur via access_token (optionnel)
     */
    async getUserInfo(accessToken: string): Promise<GoogleUserInfo> {
        this.logger.log('Fetching user info from Google');

        try {
            const response = await fetch(this.userInfoUrl, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                this.logger.error('Failed to fetch user info', errorData);
                throw new UnauthorizedException('Failed to fetch user info from Google');
            }

            const userInfo: GoogleUserInfo = await response.json();
            this.logger.log(`User info retrieved: ${userInfo.email}`);
            return userInfo;
        } catch (error) {
            this.logger.error('Error fetching user info', error.message);
            throw error;
        }
    }

    /**
     * Valide le state CSRF token
     */
    validateState(receivedState: string, expectedState: string): boolean {
        return receivedState === expectedState;
    }
}