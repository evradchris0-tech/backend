import { EquipmentStatus } from '../../domain/enums/equipment-status.enum';
import { EquipmentCondition } from '../../domain/enums/equipment-condition.enum';

export class EquipmentResponseDto {
    id: string;
    name: string;
    code: string;
    categoryName: string;
    categoryCode: string;
    spaceId?: string;
    status: EquipmentStatus;
    condition: EquipmentCondition;
    imageUrls: string[];
    createdAt: Date;
    nextMaintenanceDate?: Date;
}