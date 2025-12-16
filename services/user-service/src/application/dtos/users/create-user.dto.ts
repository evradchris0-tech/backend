// src/application/dtos/users/create-user.dto.ts

import { IsEmail, IsEnum, IsNotEmpty, IsString, IsOptional, MinLength, Matches } from 'class-validator';
import { UserRole } from '../../../domain/entities/user.entity';

export class CreateUserDto {
    @IsEmail({}, { message: 'Invalid email format' })
    @IsNotEmpty({ message: 'Email is required' })
    email: string;

    @IsString({ message: 'First name must be a string' })
    @IsNotEmpty({ message: 'First name is required' })
    @MinLength(2, { message: 'First name must be at least 2 characters' })
    firstName: string;

    @IsString({ message: 'Last name must be a string' })
    @IsNotEmpty({ message: 'Last name is required' })
    @MinLength(2, { message: 'Last name must be at least 2 characters' })
    lastName: string;

    @IsEnum(UserRole, { message: 'Invalid role. Must be SUPERADMIN, ADMINISTRATOR, SUPERVISOR, AGENT_TERRAIN, or OCCUPANT' })
    @IsNotEmpty({ message: 'Role is required' })
    role: UserRole;

    // Optionnel: numéro de chambre (uniquement pour OCCUPANT)
    @IsOptional()
    @IsString({ message: 'Room number must be a string' })
    roomNumber?: string;

    // Optionnel: ID de la chambre (VARCHAR - ex: "RDC-101", "ETAGE1-205")
    @IsOptional()
    @IsString({ message: 'Room ID must be a string' })
    @Matches(/^[A-Za-z0-9]+-[0-9]{1,4}$/, {
        message: 'ID de la chambre invalide (ex: "RDC-101", "ETAGE1-205")'
    })
    roomId?: string;


    // Optionnel: Session académique (format: YYYY-YYYY, ex: "2025-2026")
    @IsOptional()
    @IsString({ message: 'Academic session ID must be a string' })
    @Matches(/^\d{4}-\d{4}$/, { message: 'Academic session must be in format YYYY-YYYY (ex: 2025-2026)' })
    academicSessionId?: string;
}