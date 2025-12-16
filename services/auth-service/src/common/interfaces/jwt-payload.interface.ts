// src/common/interfaces/jwt-payload.interface.ts

/**
 * Interface pour le payload JWT décodé
 * Utilisée pour typer req.user après validation JwtAuthGuard
 */
export interface JwtPayloadExtended {
    userId: string;
    email: string;
    sessionId: string;
    role: string;
    status: string;
    typeUtilisateur: string;
    iat: number;
    exp: number;
}