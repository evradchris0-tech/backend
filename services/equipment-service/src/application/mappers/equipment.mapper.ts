import { EquipmentEntity } from '../../domain/entities/equipment.entity';
import { EquipmentResponseDto } from '../dtos/equipment-response.dto';

export class EquipmentMapper {
    static toDto(entity: EquipmentEntity): EquipmentResponseDto {
        const dto = new EquipmentResponseDto();
        dto.id = entity.id;
        dto.name = entity.name;
        dto.code = entity.code;

        // Aplatissement des relations pour le frontend
        if (entity.category) {
            dto.categoryName = entity.category.name;
            dto.categoryCode = entity.category.code;
        }

        dto.spaceId = entity.spaceId;
        dto.status = entity.status;
        dto.condition = entity.condition;
        dto.imageUrls = entity.imageUrls || [];
        dto.createdAt = entity.createdAt;

        // Logique métier d'affichage : Calcul prochaine maintenance
        if (entity.category && entity.category.maintenanceInterval) {
            // Logique simplifiée : date création + intervalle (à améliorer avec historique réel)
            const nextDate = new Date(entity.createdAt);
            nextDate.setDate(nextDate.getDate() + entity.category.maintenanceInterval);
            dto.nextMaintenanceDate = nextDate;
        }

        return dto;
    }

    static toDtoList(entities: EquipmentEntity[]): EquipmentResponseDto[] {
        return entities.map(e => this.toDto(e));
    }
}