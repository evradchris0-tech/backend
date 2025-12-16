// src/application/services/password.service.ts

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class PasswordService {
    private readonly ENCRYPTION_KEY: string;
    private readonly ENCRYPTION_ALGORITHM = 'aes-256-cbc';

    constructor(private readonly configService: ConfigService) {
        // Clé de chiffrement depuis les variables d'environnement
        const key = this.configService.get<string>('PASSWORD_ENCRYPTION_KEY');
        if (!key) {
            throw new Error('PASSWORD_ENCRYPTION_KEY must be defined in environment variables');
        }
        // S'assurer que la clé fait 32 bytes pour AES-256
        this.ENCRYPTION_KEY = crypto.createHash('sha256').update(key).digest('base64').substring(0, 32);
    }

    /**
     * Chiffre un mot de passe (réversible) - Pour les mots de passe auto-générés
     */
    encrypt(plainPassword: string): string {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(
            this.ENCRYPTION_ALGORITHM,
            Buffer.from(this.ENCRYPTION_KEY),
            iv,
        );

        let encrypted = cipher.update(plainPassword, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        // Retourner IV + encrypted (séparés par :)
        return `${iv.toString('hex')}:${encrypted}`;
    }

    /**
     * Déchiffre un mot de passe - Pour récupérer le mot de passe en clair
     */
    decrypt(encryptedPassword: string): string {
        const parts = encryptedPassword.split(':');
        const iv = Buffer.from(parts[0], 'hex');
        const encryptedText = parts[1];

        const decipher = crypto.createDecipheriv(
            this.ENCRYPTION_ALGORITHM,
            Buffer.from(this.ENCRYPTION_KEY),
            iv,
        );

        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    }

    /**
     * Hash un mot de passe (bcrypt) - Pour les mots de passe saisis manuellement
     * Note: Utilisé uniquement pour la vérification lors du login
     */
    async hash(plainPassword: string): Promise<string> {
        const saltRounds = this.configService.get<number>('BCRYPT_SALT_ROUNDS', 12);
        return bcrypt.hash(plainPassword, saltRounds);
    }

    /**
     * Compare un mot de passe en clair avec un mot de passe chiffré
     * Supporte à la fois le chiffrement réversible ET bcrypt
     */
    async compare(plainPassword: string, storedPassword: string): Promise<boolean> {
        try {
            // Détecter si c'est du bcrypt (commence par $2b$ ou $2a$)
            if (storedPassword.startsWith('$2b$') || storedPassword.startsWith('$2a$')) {
                return bcrypt.compare(plainPassword, storedPassword);
            }

            // Sinon, c'est du chiffrement réversible
            const decryptedPassword = this.decrypt(storedPassword);
            return plainPassword === decryptedPassword;
        } catch (error) {
            return false;
        }
    }

    /**
     * Génère un mot de passe aléatoire fort
     */
    generateRandomPassword(length: number = 16): string {
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const numbers = '0123456789';
        const symbols = '!@#$%^&*';
        const allChars = uppercase + lowercase + numbers + symbols;

        let password = '';

        // S'assurer d'avoir au moins un de chaque type
        password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
        password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
        password += numbers.charAt(Math.floor(Math.random() * numbers.length));
        password += symbols.charAt(Math.floor(Math.random() * symbols.length));

        // Compléter avec des caractères aléatoires
        for (let i = password.length; i < length; i++) {
            password += allChars.charAt(Math.floor(Math.random() * allChars.length));
        }

        // Mélanger le mot de passe
        return password.split('').sort(() => Math.random() - 0.5).join('');
    }

    /**
     * Valide la force d'un mot de passe
     */
    validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }

        if (!/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }

        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }

        if (!/[0-9]/.test(password)) {
            errors.push('Password must contain at least one number');
        }

        return {
            valid: errors.length === 0,
            errors,
        };
    }
}