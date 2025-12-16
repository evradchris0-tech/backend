// src/application/dtos/users/import-occupants.dto.ts

import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class ImportOccupantsDto {
    @IsUUID('4', { message: 'Academic session ID must be a valid UUID' })
    @IsNotEmpty({ message: 'Academic session ID is required' })
    academicSessionId: string;

    // Le fichier Excel sera envoyé via multipart/form-data
    // et sera accessible via @UploadedFile() dans le controller
}

export interface OccupantExcelRow {
    firstName: string;
    lastName: string;
    email: string;
    roomNumber: string;
    roomId?: string; // Optionnel si on cherche par numéro
}