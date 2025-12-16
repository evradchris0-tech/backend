// src/application/dtos/google-oauth-callback.dto.ts

import { IsString, IsOptional } from 'class-validator';

export class GoogleOAuthCallbackDto {
    @IsString()
    code: string;

    @IsOptional()
    @IsString()
    state?: string;

    @IsOptional()
    @IsString()
    error?: string;

    @IsOptional()
    @IsString()
    error_description?: string;

    @IsOptional()
    @IsString()
    scope?: string;

    @IsOptional()
    @IsString()
    authuser?: string;

    @IsOptional()
    @IsString()
    prompt?: string;

    @IsOptional()
    @IsString()
    hd?: string;
}