// src/application/services/verification-code.service.ts

import { Injectable, Inject, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import {
    IVerificationCodeRepository,
    VerificationCodeData,
} from '../../domain/repositories/verification-code.repository.interface';

// Re-export pour compatibilité avec les imports existants
export { VerificationCodeData } from '../../domain/repositories/verification-code.repository.interface';

@Injectable()
export class VerificationCodeService {
    private readonly logger = new Logger(VerificationCodeService.name);

    constructor(
        @Inject('IVerificationCodeRepository')
        private readonly verificationCodeRepository: IVerificationCodeRepository,
    ) {}

    /**
     * Génère un code de vérification à 6 caractères aléatoires
     */
    generateCode(): string {
        return crypto
            .randomBytes(3)
            .toString('hex')
            .toUpperCase()
            .substring(0, 6)
            .padEnd(6, '0');
    }

    /**
     * Stocke un code de vérification avec expiration (24 heures)
     */
    async storeVerificationCode(
        email: string,
        code: string,
        type: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET' = 'EMAIL_VERIFICATION',
    ): Promise<void> {
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 heures

        await this.verificationCodeRepository.save({
            code,
            email,
            expiresAt,
            type,
        });

        this.logger.log(`Verification code stored for ${email}, expires at ${expiresAt}`);
    }

    /**
     * Récupère l'email associé à un code de vérification
     */
    async getEmailByCode(code: string): Promise<string | null> {
        const data = await this.verificationCodeRepository.findByCode(code);

        if (!data) {
            this.logger.warn(`Verification code not found: ${code}`);
            return null;
        }

        // Vérifier l'expiration
        if (new Date() > data.expiresAt) {
            this.logger.warn(`Verification code expired: ${code}`);
            await this.verificationCodeRepository.delete(code);
            return null;
        }

        return data.email;
    }

    /**
     * Valide et consomme un code de vérification
     */
    async validateAndConsumeCode(code: string, email: string): Promise<boolean> {
        const data = await this.verificationCodeRepository.findByCode(code);

        if (!data) {
            this.logger.warn(`Code validation failed: code not found (${code})`);
            return false;
        }

        // Vérifier l'expiration
        if (new Date() > data.expiresAt) {
            this.logger.warn(`Code validation failed: code expired (${code})`);
            await this.verificationCodeRepository.delete(code);
            return false;
        }

        // Vérifier que l'email correspond
        if (data.email !== email) {
            this.logger.warn(
                `Code validation failed: email mismatch (code: ${code}, expected: ${data.email}, got: ${email})`,
            );
            return false;
        }

        // Consommer le code (le supprimer)
        await this.verificationCodeRepository.delete(code);
        this.logger.log(`Code validated and consumed: ${code}`);
        return true;
    }

    /**
     * Nettoie les codes expirés (appelé par un cron job ou manuellement)
     */
    async cleanupExpiredCodes(): Promise<number> {
        return this.verificationCodeRepository.deleteExpired();
    }
}