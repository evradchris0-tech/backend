// src/application/dtos/espace/assigner-occupant.dto.ts

import { IsUUID, IsOptional, IsDateString } from 'class-validator';

/**
 * DTO pour assigner un occupant a un espace
 */
export class AssignerOccupantDto {
    @IsUUID()
    occupantId: string;

    @IsOptional()
    @IsDateString()
    dateDebut?: string;

    @IsOptional()
    @IsDateString()
    dateFin?: string;
}
