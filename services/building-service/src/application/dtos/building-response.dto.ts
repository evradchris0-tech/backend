import { BuildingType } from '../../domain/enums/building-type.enum';

export class BuildingResponseDto {
    id: string;
    name: string;
    code: string;
    type: BuildingType;
    floorsCount: number;
    status: string;
    siteName?: string;
    createdAt: Date;
}