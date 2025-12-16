// src/application/dtos/refresh-token.dto.ts

import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
    @IsString({ message: 'Refresh token must be a string' })
    @IsNotEmpty({ message: 'Refresh token is required' })
    refreshToken: string;
}