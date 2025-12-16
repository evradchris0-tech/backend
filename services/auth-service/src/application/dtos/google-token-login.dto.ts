// src/application/dtos/google-token-login.dto.ts

import { IsNotEmpty, IsString } from 'class-validator';

export class GoogleTokenLoginDto {
    @IsString({ message: 'ID token must be a string' })
    @IsNotEmpty({ message: 'ID token is required' })
    idToken: string;
}