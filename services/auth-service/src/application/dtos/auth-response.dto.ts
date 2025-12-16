// src/application/dtos/auth-response.dto.ts

/**
 * DTO de réponse d'authentification
 */
export class AuthResponseDto {
    accessToken: string;
    refreshToken: string;
    sessionToken: string;
    expiresIn: number;
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        status: string;
        emailVerified: boolean;
    };
}