// src/application/dto/equipement/create-equipement.dto.ts

import {
    IsString,
    IsNotEmpty,
    IsEnum,
    IsOptional,
    IsNumber,
    Min,
    MaxLength,
    IsUUID,
    IsDateString,
} from 'class-validator';
import { TypeEquipement } from '../../../domain/enums';

/**
 * DTO pour creer un equipement
 */
export class CreateEquipementDto {
    @IsEnum(TypeEquipement)
    type: TypeEquipement;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    marque?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    modele?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    numeroSerie?: string;

    @IsOptional()
    @IsUUID()
    espaceId?: string;

    @IsOptional()
    @IsDateString()
    dateAcquisition?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    valeurAchat?: number;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;
}