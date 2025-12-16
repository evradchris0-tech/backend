// src/application/dtos/verify-email.dto.ts

import { IsString, Length, Matches, IsEmail } from 'class-validator';

export class VerifyEmailDto {
    @IsEmail()
    email: string;

    @IsString({ message: 'Code must be a string' })
    @Length(6, 6, { message: 'Code must be exactly 6 characters' })
    @Matches(/^[A-Z0-9]{6}$/, { message: 'Code must contain only uppercase letters and numbers' })
    code: string;
}