import {
    Controller,
    Get,
    Post,
    Patch,
    Body,
    Param,
    ParseUUIDPipe,
    HttpCode,
    HttpStatus
} from '@nestjs/common';
import { SpaceService } from '../../../application/services/space.service';
import { CreateSpaceDto } from '../../../application/dtos/create-space.dto';
import { SpaceMapDto } from '../../../application/dtos/space-map.dto';

@Controller() // Note: On utilise des préfixes spécifiques par méthode pour plus de flexibilité
export class SpaceController {
    constructor(private readonly spaceService: SpaceService) { }

    // Création d'un espace (Admin)
    @Post('spaces')
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() dto: CreateSpaceDto): Promise<SpaceMapDto> {
        return this.spaceService.create(dto);
    }

    // ========================================================
    // ENDPOINT CRITIQUE POUR BABYLONJS
    // ========================================================
    // Appelée par le Frontend pour charger la "Heatmap" d'un bâtiment
    // GET /buildings/:buildingId/map-data
    @Get('buildings/:buildingId/map-data')
    async getBuildingMap(@Param('buildingId', ParseUUIDPipe) buildingId: string): Promise<SpaceMapDto[]> {
        return this.spaceService.getBuildingMapData(buildingId);
    }

    // Récupérer les espaces d'un étage spécifique (Navigation 2D/3D)
    @Get('floors/:floorId/spaces')
    async getSpacesByFloor(@Param('floorId', ParseUUIDPipe) floorId: string): Promise<SpaceMapDto[]> {
        return this.spaceService.findByFloor(floorId);
    }

    // Mise à jour rapide du statut (ex: occupation, maintenance)
    @Patch('spaces/:id/status')
    async updateStatus(
        @Param('id', ParseUUIDPipe) id: string,
        @Body('status') status: string
    ): Promise<void> {
        return this.spaceService.updateStatus(id, status);
    }
}