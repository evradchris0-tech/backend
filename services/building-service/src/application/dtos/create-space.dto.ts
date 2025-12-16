import { IsString, IsNotEmpty, IsEnum, IsOptional, IsInt, Min, IsNumber, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { SpaceType } from '../../domain/enums/space-type.enum';

export class BabylonConfigDto {
    @IsString()
    @IsOptional()
    modelId?: string;

    @IsOptional()
    dimensions?: { width: number; height: number; depth: number };

    @IsOptional()
    position?: { x: number; y: number; z: number };

    @IsOptional()
    rotation?: number;
}

export class CreateSpaceDto {
    @IsString()
    @IsNotEmpty()
    floorId: string;

    @IsString()
    @IsNotEmpty()
    number: string; // "101"

    @IsString()
    @IsOptional()
    name?: string;

    @IsEnum(SpaceType)
    type: SpaceType;

    @IsInt()
    @Min(1)
    capacity: number;

    @IsNumber()
    @IsOptional()
    surfaceArea?: number;

    @IsOptional()
    @ValidateNested()
    @Type(() => BabylonConfigDto)
    babylonConfig?: BabylonConfigDto;

    @IsOptional()
    features?: {
        hasWindow: boolean;
        hasAC: boolean;
        hasRJ45: boolean;
        [key: string]: any;
    };
}