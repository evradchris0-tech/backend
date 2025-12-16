// src/application/use-cases/verify-email-by-code.use-case.ts

import {
    Injectable,
    Inject,
    BadRequestException,
    UnauthorizedException,
    Logger,
} from '@nestjs/common';
import { IAuthUserRepository } from '../../domain/repositories/auth-user.repository.interface';
import { VerificationCodeService } from '../services/verification-code.service';

@Injectable()
export class VerifyEmailByCodeUseCase {
    private readonly logger = new Logger(VerifyEmailByCodeUseCase.name);

    constructor(
        @Inject('IAuthUserRepository')
        private readonly authUserRepository: IAuthUserRepository,
        private readonly verificationCodeService: VerificationCodeService,
    ) {}

    /**
     * Vérifie l'email en utilisant un code de vérification
     * Utilisé lors du clic sur le lien dans l'email
     */
    async execute(code: string): Promise<{ email: string; message: string }> {
        // 1. Valider le code
        if (!code || code.length !== 6) {
            throw new BadRequestException('Invalid verification code format');
        }

        this.logger.log(`Attempting to verify email with code: ${code}`);

        // 2. Récupérer l'email associé au code
        const email = await this.verificationCodeService.getEmailByCode(code);

        if (!email) {
            this.logger.warn(`No email found for code: ${code}`);
            throw new UnauthorizedException(
                'Invalid or expired verification code. Please request a new one.',
            );
        }

        this.logger.log(`Code ${code} corresponds to email: ${email}`);

        // 3. Trouver l'utilisateur
        const user = await this.authUserRepository.findByEmail(email);

        if (!user) {
            this.logger.error(`User not found for email: ${email}`);
            throw new BadRequestException(
                'No account found for this email. Please contact your administrator.',
            );
        }

        // 4. Vérifier que l'email n'est pas déjà vérifié
        if (user.emailVerified) {
            this.logger.log(`Email already verified for: ${email}`);
            throw new BadRequestException('Email is already verified');
        }

        // 5. Valider et consommer le code
        const isValid = await this.verificationCodeService.validateAndConsumeCode(code, email);

        if (!isValid) {
            this.logger.warn(`Code validation failed for: ${code} and email: ${email}`);
            throw new UnauthorizedException(
                'Invalid or expired verification code. Please request a new one.',
            );
        }

        // 6. Marquer l'email comme vérifié
        user.verifyEmail();
        await this.authUserRepository.update(user);

        this.logger.log(`Email verified successfully for: ${email}`);

        return {
            email,
            message: 'Email verified successfully. You can now login.',
        };
    }
}