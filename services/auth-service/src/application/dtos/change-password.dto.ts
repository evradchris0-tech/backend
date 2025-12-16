// src/application/dtos/change-password.dto.ts

import { IsString, MinLength, Matches } from 'class-validator';

export class ChangePasswordDto {
    @IsString()
    oldPassword: string;

    @IsString()
    @MinLength(8, { message: 'New password must be at least 8 characters long' })
    @Matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        {
            message:
                'New password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
        },
    )
    newPassword: string;
}