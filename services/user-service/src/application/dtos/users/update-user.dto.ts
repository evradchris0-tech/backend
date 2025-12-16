// src/application/dtos/users/update-user.dto.ts

import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole, UserStatus } from '../../../domain/entities/user.entity';

export class UpdateUserDto {
    @IsOptional()
    @IsEmail({}, { message: 'Invalid email format' })
    email?: string;

    @IsOptional()
    @IsString({ message: 'First name must be a string' })
    @MinLength(2, { message: 'First name must be at least 2 characters' })
    firstName?: string;

    @IsOptional()
    @IsString({ message: 'Last name must be a string' })
    @MinLength(2, { message: 'Last name must be at least 2 characters' })
    lastName?: string;

    @IsOptional()
    @IsEnum(UserRole, { message: 'Invalid role' })
    role?: UserRole;

    @IsOptional()
    @IsEnum(UserStatus, { message: 'Invalid status' })
    status?: UserStatus;

    // Optionnel: changement de chambre pour OCCUPANT
    @IsOptional()
    @IsString()
    roomId?: string;

    @IsOptional()
    @IsString()
    roomNumber?: string;

    @IsOptional()
    @IsString()
    academicSessionId?: string;
}