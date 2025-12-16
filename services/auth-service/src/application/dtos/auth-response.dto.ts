// src/application/dtos/auth-response.dto.ts

export class AuthResponseDto {
    accessToken: string;
    refreshToken: string;
    sessionToken: string;
    expiresIn: number;
    user: {
        id: string;
        email: string;
        // Note: On ne retourne que l'id et email ici
        // Le frontend devra appeler user-service pour obtenir le profil complet
    };
}