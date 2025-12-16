// src/application/dtos/logout.dto.ts

import { IsNotEmpty, IsUUID } from 'class-validator';

/**
 * DTO pour la déconnexion (logout)
 */
export class LogoutDto {
    @IsNotEmpty()
    @IsUUID()
    sessionId: string;
}