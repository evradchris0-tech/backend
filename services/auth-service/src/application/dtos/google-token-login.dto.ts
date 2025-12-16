// src/application/dtos/google-token-login.dto.ts

import { IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO pour le login via Google Token
 */
export class GoogleTokenLoginDto {
    @IsNotEmpty()
    @IsString()
    idToken: string;
}