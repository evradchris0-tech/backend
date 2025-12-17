// src/application/dto/batiment/create-batiment.dto.ts

import {
    IsString,
    IsNotEmpty,
    IsEnum,
    IsOptional,
    IsNumber,
    Min,
    MaxLength,
    IsDateString,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TypeBatiment } from '../../../domain/enums';

/**
 * DTO pour les coordonnees GPS
 */
export class CoordonneesDto {
    @IsNumber()
    @Min(-90)
    latitude: number;

    @IsNumber()
    @Min(-180)
    longitude: number;

    @IsOptional()
    @IsNumber()
    altitude?: number;
}

/**
 * DTO pour creer un batiment
 */
export class CreateBatimentDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    nom: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    code: string;

    @IsEnum(TypeBatiment)
    type: TypeBatiment;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    adresse?: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => CoordonneesDto)
    coordonnees?: CoordonneesDto;

    @IsOptional()
    @IsNumber()
    @Min(1)
    nombreEtages?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    superficie?: number;

    @IsOptional()
    @IsDateString()
    dateConstruction?: string;

    @IsOptional()
    @IsString()
    @MaxLength(1000)
    description?: string;

    @IsOptional()
    @IsString()
    planBatiment?: string;
}