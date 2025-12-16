// src/application/dtos/jwt-payload.dto.ts

export interface JwtPayload {
    userId: string;
    email: string;
    sessionId: string;
}