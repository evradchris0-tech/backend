// src/application/services/google-token-verifier.service.ts

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';

export interface GoogleTokenPayload {
    sub: string; // Google User ID
    email: string;
    email_verified: boolean;
    given_name: string;
    family_name: string;
    picture: string;
}

@Injectable()
export class GoogleTokenVerifierService {
    private client: OAuth2Client;

    constructor(private readonly configService: ConfigService) {
        this.client = new OAuth2Client(
            this.configService.get<string>('GOOGLE_CLIENT_ID'),
        );
    }

    /**
     * Vérifie un id_token Google et retourne le payload
     */
    async verifyIdToken(idToken: string): Promise<GoogleTokenPayload> {
        try {
            const ticket = await this.client.verifyIdToken({
                idToken,
                audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
            });

            const payload = ticket.getPayload();

            if (!payload) {
                throw new Error('Invalid token payload');
            }

            return {
                sub: payload.sub,
                email: payload.email!,
                email_verified: payload.email_verified!,
                given_name: payload.given_name || '',
                family_name: payload.family_name || '',
                picture: payload.picture || '',
            };
        } catch (error) {
            throw new Error(`Google token verification failed: ${error.message}`);
        }
    }
}