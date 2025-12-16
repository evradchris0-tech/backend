import { IsString, IsNotEmpty, IsUUID, IsOptional } from 'class-validator';

export class MoveEquipmentDto {
    @IsUUID()
    @IsNotEmpty()
    equipmentId: string;

    @IsUUID()
    @IsOptional()
    targetSpaceId?: string;

    @IsUUID()
    @IsNotEmpty()
    performedBy: string;

    @IsString()
    @IsOptional()
    reason?: string;
}