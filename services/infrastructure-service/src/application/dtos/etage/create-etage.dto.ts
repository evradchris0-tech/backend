// src/application/dto/etage/create-etage.dto.ts

import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsNumber,
    IsInt,
    Min,
    MaxLength,
    IsUUID,
} from 'class-validator';

/**
 * DTO pour creer un etage
 */
export class CreateEtageDto {
    @IsUUID()
    @IsNotEmpty()
    batimentId: string;

    @IsInt()
    numero: number;

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