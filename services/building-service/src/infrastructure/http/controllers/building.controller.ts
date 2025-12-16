import {
    Controller,
    Get,
    Post,
    Delete,
    Body,
    Param,
    ParseUUIDPipe,
    HttpCode,
    HttpStatus
} from '@nestjs/common';
import { BuildingService } from '../../../application/services/building.service';
import { CreateBuildingDto } from '../../../application/dtos/create-building.dto';
import { BuildingResponseDto } from '../../../application/dtos/building-response.dto';

@Controller('buildings')
export class BuildingController {
    constructor(private readonly buildingService: BuildingService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() dto: CreateBuildingDto): Promise<BuildingResponseDto> {
        return this.buildingService.create(dto);
    }

    @Get()
    async findAll(): Promise<BuildingResponseDto[]> {
        return this.buildingService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<BuildingResponseDto> {
        return this.buildingService.findOne(id);
    }

    // Endpoint spécifique pour récupérer les bâtiments d'un site
    // Route: GET /buildings/site/:siteId
    @Get('site/:siteId')
    async findBySite(@Param('siteId', ParseUUIDPipe) siteId: string): Promise<BuildingResponseDto[]> {
        return this.buildingService.getBuildingsBySite(siteId);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
        return this.buildingService.delete(id);
    }
}