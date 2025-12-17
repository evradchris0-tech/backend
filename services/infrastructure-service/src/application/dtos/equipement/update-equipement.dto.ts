// src/application/dto/equipement/update-equipement.dto.ts

import { PartialType, OmitType } from '@nestjs/mapped-types';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { CreateEquipementDto } from './create-equipement.dto';
import { StatutEquipement } from '../../../domain/enums';

/**
 * DTO pour mettre a jour un equipement
 */
export class UpdateEquipementDto extends PartialType(
    OmitType(CreateEquipementDto, ['type'] as const),
) {}

/**
 * DTO pour changer le statut d'un equipement
 */
export class ChangeStatutEquipementDto {
    @IsEnum(StatutEquipement)
    @IsNotEmpty()
    nouveauStatut: StatutEquipement;

    @IsString()
    @IsNotEmpty()
    @MaxLength(500)
    motif: string;
}

/**
 * DTO pour assigner un equipement a un espace
 */
export class AssignerEquipementDto {
    @IsUUID()
    @IsNotEmpty()
    espaceId: string;

    @IsOptional()
    @IsUUID()
    responsableId?: string;
}