// src/application/dtos/register.dto.ts

import { IsEmail, IsString, MinLength, Matches, IsOptional } from 'class-validator';

export class RegisterDto {
    @IsEmail({}, { message: 'Email must be a valid email address' })
    email: string;

    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @Matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        {
            message:
                'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
        },
    )
    password: string;

    @IsString()
    @MinLength(2, { message: 'First name must be at least 2 characters' })
    firstName: string;

    @IsString()
    @MinLength(2, { message: 'Last name must be at least 2 characters' })
    lastName: string;

    @IsOptional()
    @IsString()
    phoneNumber?: string;
}

/**
 * Réponse après inscription réussie
 */
export class RegisterResponseDto {
    /**
     * ID de l'utilisateur créé
     */
    userId: string;

    /**
     * Email de l'utilisateur
     */
    email: string;

    /**
     * Message de confirmation
     */
    message: string;

    /**
     * Indique si un email de vérification a été envoyé
     */
    verificationEmailSent: boolean;
}