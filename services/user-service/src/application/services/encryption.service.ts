// src/application/services/encryption.service.ts

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
    private readonly ENCRYPTION_KEY: string;
    private readonly ENCRYPTION_ALGORITHM = 'aes-256-cbc';

    constructor(private readonly configService: ConfigService) {
        const key = this.configService.get<string>('PASSWORD_ENCRYPTION_KEY');
        if (!key) {
            throw new Error('PASSWORD_ENCRYPTION_KEY must be defined in environment variables');
        }
        this.ENCRYPTION_KEY = crypto.createHash('sha256').update(key).digest('base64').substring(0, 32);
    }

    /**
     * Chiffre une chaîne (réversible)
     */
    encrypt(plainText: string): string {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(
            this.ENCRYPTION_ALGORITHM,
            Buffer.from(this.ENCRYPTION_KEY),
            iv,
        );

        let encrypted = cipher.update(plainText, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        return `${iv.toString('hex')}:${encrypted}`;
    }

    /**
     * Déchiffre une chaîne
     */
    decrypt(encryptedText: string): string {
        const parts = encryptedText.split(':');
        const iv = Buffer.from(parts[0], 'hex');
        const encrypted = parts[1];

        const decipher = crypto.createDecipheriv(
            this.ENCRYPTION_ALGORITHM,
            Buffer.from(this.ENCRYPTION_KEY),
            iv,
        );

        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    }
}