// src/application/dtos/resend-verification-code.dto.ts

import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResendVerificationCodeDto {
    @IsEmail({}, { message: 'Invalid email format' })
    @IsNotEmpty({ message: 'Email is required' })
    email: string;
}