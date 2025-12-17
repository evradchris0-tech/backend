// src/application/dto/etage/update-etage.dto.ts

import {
    IsString,
    IsOptional,
    IsNumber,
    Min,
    MaxLength,
} from 'class-validator';

/**
 * DTO pour mettre a jour un etage
 */
export class UpdateEtageDto {
    @IsOptional()
    @IsString()
    @MaxLength(100)
    designation?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    superficie?: number;

    @IsOptional()
    @IsString()
    planEtage?: string;
}
