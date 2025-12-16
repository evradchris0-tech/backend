// src/common/interfaces/jwt-payload.interface.ts

export interface JwtPayload {
    userId: string;
    email: string;
    sessionId: string;
    role: 'ADMINISTRATEUR' | 'SUPERVISEUR' | 'AGENT_TERRAIN' | 'OCCUPANT';
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
    typeUtilisateur: string;
    iat: number;
    exp: number;
}
