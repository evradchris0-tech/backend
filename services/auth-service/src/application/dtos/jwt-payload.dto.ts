// src/application/dtos/jwt-payload.dto.ts

/**
 * Payload JWT conforme au cahier des charges
 * Section II.1 - Entités liées à la gestion des utilisateurs
 */
export interface JwtPayload {
    /**
     * Identifiant unique de l'utilisateur
     */
    userId: string;

    /**
     * Email de l'utilisateur
     */
    email: string;

    /**
     * Identifiant de la session active
     */
    sessionId: string;

    /**
     * Rôle de l'utilisateur (conforme cahier des charges)
     * Valeurs: SUPERADMIN | ADMINISTRATOR | SUPERVISOR | AGENT_TERRAIN | OCCUPANT
     */
    role: string;

    /**
     * Statut du compte utilisateur
     * Valeurs: ACTIVE | INACTIVE | LOCKED | PENDING_EMAIL_VERIFICATION
     */
    status: string;

    /**
     * Alias de 'role' pour compatibilité cahier des charges
     */
    typeUtilisateur: string;

    /**
     * Timestamp d'émission du token (optionnel, géré par JWT)
     */
    iat?: number;

    /**
     * Timestamp d'expiration du token (optionnel, géré par JWT)
     */
    exp?: number;
}

/**
 * DTO pour la réponse d'authentification incluant le profil utilisateur
 */
export interface AuthResponseWithProfile {
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