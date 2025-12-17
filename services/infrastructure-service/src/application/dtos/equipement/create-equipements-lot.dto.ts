// src/application/dtos/equipement/create-equipements-lot.dto.ts

import {
    IsEnum,
    IsOptional,
    IsNumber,
    Min,
    Max,
    MaxLength,
    IsString,
    IsUUID,
} from 'class-validator';
import { TypeEquipement } from '../../../domain/enums';

/**
 * DTO pour creer un lot d'equipements identiques
 */
export class CreateEquipementsLotDto {
    @IsEnum(TypeEquipement)
    type: TypeEquipement;

    @IsNumber()
    @Min(1)
    @Max(100)
    quantite: number;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    marque?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    modele?: string;

    @IsOptional()
    @IsUUID()
    espaceId?: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;
}
