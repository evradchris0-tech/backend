// src/application/dto/batiment/batiment-filters.dto.ts

import { IsEnum, IsOptional, IsBoolean, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { TypeBatiment } from '../../../domain/enums';

/**
 * DTO pour les filtres de recherche des batiments
 */
export class BatimentFiltersDto {
    @IsOptional()
    @IsEnum(TypeBatiment)
    type?: TypeBatiment;

    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    actif?: boolean;

    @IsOptional()
    @IsString()
    recherche?: string;
}
