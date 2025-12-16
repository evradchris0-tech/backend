import { IsString, IsNotEmpty, IsEnum, IsOptional, IsInt, Min, IsJSON, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { BuildingType } from '../../domain/enums/building-type.enum';

class LocationDataDto {
    @IsNotEmpty()
    x: number;

    @IsNotEmpty()
    y: number;

    @IsNotEmpty()
    z: number;

    @IsNotEmpty()
    rotation: number;
}

export class CreateBuildingDto {
    @IsString()
    @IsNotEmpty()
    siteId: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    code: string;

    @IsEnum(BuildingType)
    type: BuildingType;

    @IsInt()
    @Min(0)
    floorsCount: number;

    // Validation imbriquée pour le JSON BabylonJS
    @IsOptional()
    @ValidateNested()
    @Type(() => LocationDataDto)
    locationData?: LocationDataDto;

    @IsOptional()
    metadata?: Record<string, any>;
}