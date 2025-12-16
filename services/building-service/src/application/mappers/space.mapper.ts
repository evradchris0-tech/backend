import { SpaceEntity } from '../../domain/entities/space.entity';
import { SpaceMapDto } from '../dtos/space-map.dto';

export class SpaceMapper {
    // Mapper optimisé pour la 3D (BabylonJS)
    static toMapDto(entity: SpaceEntity): SpaceMapDto {
        const dto = new SpaceMapDto();
        dto.id = entity.id;
        dto.number = entity.number;
        dto.type = entity.type;
        dto.status = entity.status;

        // On passe directement la config JSON stockée ou une config par défaut
        dto.babylonConfig = entity.babylonConfig || {
            // Fallback si pas de config (éviter crash frontend)
            modelId: 'generic-room-v1',
            dimensions: { width: 4, height: 3, depth: 4 },
            position: { x: 0, y: 0, z: 0 },
            rotation: 0
        };

        // Calcul d'indicateurs rapides (mocké pour l'instant, sera connecté aux agrégats)
        dto.alerts = {
            incidentCount: 0, // À implémenter avec RabbitMQ/IncidentService
            occupancyRate: entity.status === 'OCCUPIED' ? 100 : 0
        };

        return dto;
    }

    static toMapDtoList(entities: SpaceEntity[]): SpaceMapDto[] {
        return entities.map((entity) => this.toMapDto(entity));
    }
}