// src/application/dtos/equipement/create-kit-chambre.dto.ts

import { IsUUID, IsOptional, IsBoolean } from 'class-validator';

/**
 * DTO pour creer un kit standard d'equipements pour une chambre
 */
export class CreateKitChambreDto {
    @IsUUID()
    espaceId: string;

    @IsOptional()
    @IsBoolean()
    inclureLit?: boolean;

    @IsOptional()
    @IsBoolean()
    inclureArmoire?: boolean;

    @IsOptional()
    @IsBoolean()
    inclureBureau?: boolean;

    @IsOptional()
    @IsBoolean()
    inclureChaise?: boolean;

    @IsOptional()
    @IsBoolean()
    inclureEtagere?: boolean;
}
