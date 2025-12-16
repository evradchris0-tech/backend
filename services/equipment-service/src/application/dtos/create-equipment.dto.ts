import { IsString, IsNotEmpty, IsUUID, IsOptional, IsEnum, IsNumber, IsDateString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { EquipmentCondition } from '../../domain/enums/equipment-condition.enum';
import { EquipmentStatus } from '../../domain/enums/equipment-status.enum';

export class CreateEquipmentDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsUUID()
    @IsNotEmpty()
    categoryId: string;

    @IsString()
    @IsOptional()
    serialNumber?: string;

    @IsUUID()
    @IsOptional()
    spaceId?: string;

    @IsEnum(EquipmentStatus)
    @IsOptional()
    status?: EquipmentStatus;

    @IsEnum(EquipmentCondition)
    @IsOptional()
    condition?: EquipmentCondition;

    // Données d'achat
    @IsNumber()
    @IsOptional()
    purchasePrice?: number;

    @IsDateString()
    @IsOptional()
    purchaseDate?: string;

    @IsDateString()
    @IsOptional()
    warrantyEndDate?: string;

    // URLs Cloudinary
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    imageUrls?: string[];

    @IsOptional()
    metadata?: Record<string, any>;
}