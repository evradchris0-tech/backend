// src/application/dtos/espace/create-chambres-lot.dto.ts

import {
    IsUUID,
    IsNumber,
    Min,
    Max,
    IsOptional,
    IsEnum,
    IsString,
    MaxLength,
} from 'class-validator';
import { TypeEspace } from '../../../domain/enums';

/**
 * DTO pour creer un lot de chambres
 */
export class CreateChambresLotDto {
    @IsUUID()
    etageId: string;

    @IsNumber()
    @Min(1)
    @Max(50)
    quantite: number;

    @IsEnum(TypeEspace)
    type: TypeEspace;

    @IsOptional()
    @IsString()
    @MaxLength(10)
    prefixeNumero?: string;

    @IsOptional()
    @IsNumber()
    @Min(1)
    numeroDepart?: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    superficie?: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    capacite?: number;
}
