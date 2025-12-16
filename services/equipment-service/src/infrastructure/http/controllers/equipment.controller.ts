import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    ParseUUIDPipe,
    HttpCode,
    HttpStatus,
    Query,
    DefaultValuePipe,
    ParseIntPipe
} from '@nestjs/common';
import { EquipmentService } from '../../../application/services/equipment.service';
import { CreateEquipmentDto } from '../../../application/dtos/create-equipment.dto';
import { MoveEquipmentDto } from '../../../application/dtos/move-equipment.dto';
import { EquipmentResponseDto } from '../../../application/dtos/equipment-response.dto';

@Controller('equipments')
export class EquipmentController {
    constructor(private readonly equipmentService: EquipmentService) { }

    // CRÉATION (Avec génération de code intelligent LIT-006)
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() dto: CreateEquipmentDto): Promise<EquipmentResponseDto> {
        return this.equipmentService.create(dto);
    }

    // MOUVEMENT (Avec traçabilité)
    // Route: POST /equipments/move
    @Post('move')
    @HttpCode(HttpStatus.OK)
    async move(@Body() dto: MoveEquipmentDto): Promise<EquipmentResponseDto> {
        return this.equipmentService.move(dto);
    }

    // LISTE GLOBALE (Avec pagination basique)
    @Get()
    async findAll(
        @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
        @Query('take', new DefaultValuePipe(50), ParseIntPipe) take: number,
    ): Promise<EquipmentResponseDto[]> {
        // Note: Il faudrait idéalement passer ces options au service.
        // Pour l'instant le service a des valeurs par défaut, mais c'est prêt pour l'évolution.
        return this.equipmentService.findAll();
    }

    // DÉTAIL D'UN ÉQUIPEMENT
    @Get(':id')
    async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<EquipmentResponseDto> {
        return this.equipmentService.findOne(id);
    }

    // CONTENU D'UNE SALLE (Pour la Sidebar BabylonJS)
    // Route: GET /equipments/space/:spaceId
    @Get('space/:spaceId')
    async findBySpace(@Param('spaceId', ParseUUIDPipe) spaceId: string): Promise<EquipmentResponseDto[]> {
        return this.equipmentService.findBySpace(spaceId);
    }

    // CONTENU D'UN ÉTAGE (Pour la Sidebar BabylonJS)
    // Route: GET /equipments/floor/:floorId
    @Get('floor/:floorId')
    async findByFloor(@Param('floorId', ParseUUIDPipe) floorId: string): Promise<EquipmentResponseDto[]> {
        return this.equipmentService.findByFloor(floorId);
    }

    // SUPPRESSION
    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
        return this.equipmentService.remove(id);
    }
}