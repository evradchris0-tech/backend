// src/application/dtos/etage/create-multiple-etages.dto.ts

import { IsUUID, IsNumber, Min, Max, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * DTO pour creer plusieurs etages en une seule operation
 */
export class CreateMultipleEtagesDto {
    @IsUUID()
    batimentId: string;

    @IsNumber()
    @Min(1)
    @Max(50)
    nombreEtages: number;

    @IsOptional()
    @IsNumber()
    @Min(-5)
    numeroDepart?: number;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;
}
