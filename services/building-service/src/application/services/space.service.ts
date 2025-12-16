import { Injectable, ConflictException, NotFoundException, Inject } from '@nestjs/common';
import { ISpaceRepository } from '../../domain/repositories/space.repository.interface';
import { CreateSpaceDto } from '../dtos/create-space.dto';
import { SpaceMapDto } from '../dtos/space-map.dto';
import { SpaceEntity } from '../../domain/entities/space.entity';
import { SpaceMapper } from '../mappers/space.mapper';
// Note: Idéalement, on injecterait IFloorRepository pour valider l'existence de l'étage
// mais pour ce MVP, on suppose que le frontend envoie un floorId valide.

@Injectable()
export class SpaceService {
    constructor(
        @Inject('ISpaceRepository')
        private readonly spaceRepo: ISpaceRepository,
    ) { }

    async create(dto: CreateSpaceDto): Promise<SpaceMapDto> {
        // 1. Validation Métier : Pas de doublon de numéro de porte sur le même étage
        const existingSpace = await this.spaceRepo.findByNumber(dto.number, dto.floorId);
        if (existingSpace) {
            throw new ConflictException(`Space number '${dto.number}' already exists on this floor.`);
        }

        // 2. Création Entité
        const space = new SpaceEntity();
        space.floorId = dto.floorId;
        space.number = dto.number;
        space.name = dto.name;
        space.type = dto.type;
        space.capacity = dto.capacity;
        space.surfaceArea = dto.surfaceArea;
        space.babylonConfig = dto.babylonConfig; // Configuration 3D
        space.features = dto.features;

        // IMPORTANT : On doit aussi peupler le buildingId (denormalized). 
        // Dans une implémentation complète, on récupérerait le Floor pour obtenir son buildingId.
        // Pour l'instant, on laisse la base de données gérer via Trigger ou on l'ajoute plus tard.
        // space.buildingId = floor.buildingId; 

        const savedSpace = await this.spaceRepo.save(space);
        return SpaceMapper.toMapDto(savedSpace);
    }

    // C'est LA méthode critique pour BabylonJS
    // Elle doit être ultra-rapide
    async getBuildingMapData(buildingId: string): Promise<SpaceMapDto[]> {
        // Utilise la méthode optimisée du repository (select partiel)
        const spaces = await this.spaceRepo.findWithBabylonConfig(buildingId);
        return SpaceMapper.toMapDtoList(spaces);
    }

    async findByFloor(floorId: string): Promise<SpaceMapDto[]> {
        const spaces = await this.spaceRepo.findByFloorId(floorId);
        return SpaceMapper.toMapDtoList(spaces);
    }

    async updateStatus(id: string, status: string): Promise<void> {
        const space = await this.spaceRepo.findById(id);
        if (!space) throw new NotFoundException('Space not found');

        space.status = status;
        await this.spaceRepo.save(space);
    }
}