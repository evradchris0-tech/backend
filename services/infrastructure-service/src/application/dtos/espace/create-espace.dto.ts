// src/application/dto/espace/create-espace.dto.ts

import {
    IsString,
    IsNotEmpty,
    IsEnum,
    IsOptional,
    IsNumber,
    Min,
    MaxLength,
    IsUUID,
} from 'class-validator';
import { TypeEspace } from '../../../domain/enums';

/**
 * DTO pour creer un espace
 */
export class CreateEspaceDto {
    @IsUUID()
    @IsNotEmpty()
    etageId: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    numero: string;

    @IsEnum(TypeEspace)
    type: TypeEspace;

    @IsOptional()
    @IsNumber()
    @Min(0)
    superficie?: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    capacite?: number;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;
}