// src/application/dtos/users/assign-room.dto.ts

import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class AssignRoomDto {
    @IsString({ message: 'Room ID must be a string' })
    @IsNotEmpty({ message: 'Room ID is required' })
    roomId: string;

    @IsString({ message: 'Room number must be a string' })
    @IsNotEmpty({ message: 'Room number is required' })
    roomNumber: string;

    @IsString({ message: 'Academic session must be a string' })
    @IsNotEmpty({ message: 'Academic session is required' })
    @Matches(/^\d{4}-\d{4}$/, { message: 'Academic session must be in format YYYY-YYYY (ex: 2025-2026)' })
    academicSessionId: string;
}