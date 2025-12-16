import { Injectable, ConflictException, NotFoundException, Inject } from '@nestjs/common';
import { IBuildingRepository } from '../../domain/repositories/building.repository.interface';
import { CreateBuildingDto } from '../dtos/create-building.dto';
import { BuildingResponseDto } from '../dtos/building-response.dto';
import { BuildingEntity } from '../../domain/entities/building.entity';
import { BuildingMapper } from '../mappers/building.mapper';

@Injectable()
export class BuildingService {
    constructor(
        @Inject('IBuildingRepository')
        private readonly buildingRepo: IBuildingRepository,
    ) { }

    async create(dto: CreateBuildingDto): Promise<BuildingResponseDto> {
        const exists = await this.buildingRepo.exists(dto.code, dto.siteId);
        if (exists) {
            throw new ConflictException(`Building with code '${dto.code}' already exists on this site.`);
        }

        // 2. Création de l'entité
        const building = new BuildingEntity();
        building.siteId = dto.siteId;
        building.name = dto.name;
        building.code = dto.code;
        building.type = dto.type;
        building.floorsCount = dto.floorsCount;
        building.locationData = dto.locationData;
        building.metadata = dto.metadata;

        // 3. Sauvegarde
        const savedBuilding = await this.buildingRepo.save(building);

        // 4. Transformation DTO
        return BuildingMapper.toDto(savedBuilding);
    }

    async findAll(): Promise<BuildingResponseDto[]> {
        const buildings = await this.buildingRepo.findAll();
        return BuildingMapper.toDtoList(buildings);
    }

    async findOne(id: string): Promise<BuildingResponseDto> {
        const building = await this.buildingRepo.findById(id);
        if (!building) {
            throw new NotFoundException(`Building with ID '${id}' not found.`);
        }
        return BuildingMapper.toDto(building);
    }

    async getBuildingsBySite(siteId: string): Promise<BuildingResponseDto[]> {
        const buildings = await this.buildingRepo.findBySiteId(siteId);
        return BuildingMapper.toDtoList(buildings);
    }

    async delete(id: string): Promise<void> {
        const building = await this.buildingRepo.findById(id);
        if (!building) {
            throw new NotFoundException(`Building with ID '${id}' not found.`);
        }
        await this.buildingRepo.delete(id);
    }
}