import { SpaceEntity } from '../../domain/entities/space.entity';
import { SpaceMapDto } from '../dtos/space-map.dto';

export class SpaceMapper {
    static toMapDto(entity: SpaceEntity): SpaceMapDto {
        const dto = new SpaceMapDto();
        dto.id = entity.id;
        dto.number = entity.number;
        dto.type = entity.type;
        dto.status = entity.status;

        dto.babylonConfig = entity.babylonConfig || {
            modelId: 'generic-room-v1',
            dimensions: { width: 4, height: 3, depth: 4 },
            position: { x: 0, y: 0, z: 0 },
            rotation: 0
        };

        dto.alerts = {
            incidentCount: 0,
            occupancyRate: entity.status === 'OCCUPIED' ? 100 : 0
        };

        return dto;
    }

    static toMapDtoList(entities: SpaceEntity[]): SpaceMapDto[] {
        return entities.map((entity) => this.toMapDto(entity));
    }
}