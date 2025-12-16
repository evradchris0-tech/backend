import { BuildingEntity } from '../../domain/entities/building.entity';
import { BuildingResponseDto } from '../dtos/building-response.dto';

export class BuildingMapper {
  static toDto(entity: BuildingEntity): BuildingResponseDto {
    const dto = new BuildingResponseDto();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.code = entity.code;
    dto.type = entity.type;
    dto.floorsCount = entity.floorsCount;
    dto.status = entity.status;
    dto.siteName = entity.site ? entity.site.name : undefined;
    dto.createdAt = entity.createdAt;
    return dto;
  }

  static toDtoList(entities: BuildingEntity[]): BuildingResponseDto[] {
    return entities.map((entity) => this.toDto(entity));
  }
}