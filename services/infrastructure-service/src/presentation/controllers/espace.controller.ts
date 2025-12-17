// src/presentation/controllers/espace.controller.ts

import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    HttpStatus,
    HttpCode,
    ParseUUIDPipe,
    ValidationPipe,
    UseGuards,
    Logger,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiQuery,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { EspaceService } from '../../application/services/espace.service';
import {
    CreateEspaceDto,
    UpdateEspaceDto,
    CreateChambresLotDto,
    AssignerOccupantDto,
} from '../../application/dtos';
import { TypeEspace } from '../../domain/enums';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';

/**
 * Controller REST pour la gestion des espaces
 */
@ApiTags('Espaces')
@ApiBearerAuth()
@Controller('espaces')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EspaceController {
    private readonly logger = new Logger(EspaceController.name);

    constructor(private readonly espaceService: EspaceService) {}

    /**
     * Cree un nouvel espace
     */
    @Post()
    @Roles('ADMIN', 'SUPER_ADMIN')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Creer un nouvel espace' })
    @ApiResponse({ status: 201, description: 'Espace cree avec succes' })
    @ApiResponse({ status: 400, description: 'Donnees invalides' })
    @ApiResponse({ status: 409, description: 'Numero espace deja existant dans cet etage' })
    async create(
        @Body(new ValidationPipe({ transform: true })) dto: CreateEspaceDto,
    ) {
        this.logger.log(`Creating espace: ${dto.numero}`);
        const espace = await this.espaceService.create(dto);
        return {
            success: true,
            message: 'Espace cree avec succes',
            data: espace,
        };
    }

    /**
     * Cree un lot de chambres
     */
    @Post('chambres/lot')
    @Roles('ADMIN', 'SUPER_ADMIN')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Creer un lot de chambres' })
    @ApiResponse({ status: 201, description: 'Chambres creees avec succes' })
    async createChambres(
        @Body(new ValidationPipe({ transform: true })) dto: CreateChambresLotDto,
    ) {
        this.logger.log(`Creating ${dto.quantite} chambres for etage: ${dto.etageId}`);
        const espaces = await this.espaceService.createChambres(
            dto.etageId,
            dto.prefixeNumero || '',
            dto.quantite,
            dto.type,
            dto.numeroDepart,
        );
        return {
            success: true,
            message: `${espaces.length} chambres creees avec succes`,
            data: espaces,
        };
    }

    /**
     * Recupere un espace par son ID
     */
    @Get(':id')
    @Roles('ADMIN', 'SUPER_ADMIN', 'SUPERVISEUR', 'AGENT')
    @ApiOperation({ summary: 'Recuperer un espace par ID' })
    @ApiParam({ name: 'id', description: 'UUID de l\'espace' })
    @ApiResponse({ status: 200, description: 'Espace trouve' })
    @ApiResponse({ status: 404, description: 'Espace non trouve' })
    async findById(@Param('id', ParseUUIDPipe) id: string) {
        const espace = await this.espaceService.findById(id);
        return {
            success: true,
            data: espace,
        };
    }

    /**
     * Recupere un espace avec ses equipements
     */
    @Get(':id/equipements')
    @Roles('ADMIN', 'SUPER_ADMIN', 'SUPERVISEUR', 'AGENT')
    @ApiOperation({ summary: 'Recuperer un espace avec ses equipements' })
    @ApiParam({ name: 'id', description: 'UUID de l\'espace' })
    @ApiResponse({ status: 200, description: 'Espace avec equipements' })
    async findByIdWithEquipements(@Param('id', ParseUUIDPipe) id: string) {
        const espace = await this.espaceService.findByIdWithEquipements(id);
        return {
            success: true,
            data: espace,
        };
    }

    /**
     * Recupere les espaces d'un etage
     */
    @Get('etage/:etageId')
    @Roles('ADMIN', 'SUPER_ADMIN', 'SUPERVISEUR', 'AGENT')
    @ApiOperation({ summary: 'Lister les espaces d\'un etage' })
    @ApiParam({ name: 'etageId', description: 'UUID de l\'etage' })
    @ApiResponse({ status: 200, description: 'Liste des espaces' })
    async findByEtage(@Param('etageId', ParseUUIDPipe) etageId: string) {
        const espaces = await this.espaceService.findByEtage(etageId);
        return {
            success: true,
            data: espaces,
            total: espaces.length,
        };
    }

    /**
     * Recupere les espaces d'un batiment
     */
    @Get('batiment/:batimentId')
    @Roles('ADMIN', 'SUPER_ADMIN', 'SUPERVISEUR', 'AGENT')
    @ApiOperation({ summary: 'Lister les espaces d\'un batiment' })
    @ApiParam({ name: 'batimentId', description: 'UUID du batiment' })
    @ApiResponse({ status: 200, description: 'Liste des espaces' })
    async findByBatiment(@Param('batimentId', ParseUUIDPipe) batimentId: string) {
        const espaces = await this.espaceService.findByBatiment(batimentId);
        return {
            success: true,
            data: espaces,
            total: espaces.length,
        };
    }

    /**
     * Recupere les espaces defectueux
     */
    @Get('status/defectueux')
    @Roles('ADMIN', 'SUPER_ADMIN', 'SUPERVISEUR', 'AGENT')
    @ApiOperation({ summary: 'Lister les espaces defectueux' })
    @ApiQuery({ name: 'batimentId', required: false, description: 'Filtrer par batiment' })
    @ApiResponse({ status: 200, description: 'Liste des espaces defectueux' })
    async findDefectueux(@Query('batimentId') batimentId?: string) {
        const espaces = await this.espaceService.findDefectueux(batimentId);
        return {
            success: true,
            data: espaces,
            total: espaces.length,
        };
    }

    /**
     * Recupere les chambres disponibles
     */
    @Get('chambres/disponibles')
    @Roles('ADMIN', 'SUPER_ADMIN', 'SUPERVISEUR')
    @ApiOperation({ summary: 'Lister les chambres disponibles' })
    @ApiQuery({ name: 'batimentId', required: false, description: 'Filtrer par batiment' })
    @ApiResponse({ status: 200, description: 'Liste des chambres disponibles' })
    async findChambresDisponibles(@Query('batimentId') batimentId?: string) {
        const chambres = await this.espaceService.findChambresDisponibles();
        return {
            success: true,
            data: chambres,
            total: chambres.length,
        };
    }

    /**
     * Met a jour un espace
     */
    @Put(':id')
    @Roles('ADMIN', 'SUPER_ADMIN')
    @ApiOperation({ summary: 'Mettre a jour un espace' })
    @ApiParam({ name: 'id', description: 'UUID de l\'espace' })
    @ApiResponse({ status: 200, description: 'Espace mis a jour' })
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body(new ValidationPipe({ transform: true })) dto: UpdateEspaceDto,
    ) {
        this.logger.log(`Updating espace: ${id}`);
        const espace = await this.espaceService.update(id, dto);
        return {
            success: true,
            message: 'Espace mis a jour avec succes',
            data: espace,
        };
    }

    /**
     * Assigne un occupant a un espace
     */
    @Put(':id/occupant')
    @Roles('ADMIN', 'SUPER_ADMIN')
    @ApiOperation({ summary: 'Assigner un occupant a un espace' })
    @ApiParam({ name: 'id', description: 'UUID de l\'espace' })
    @ApiResponse({ status: 200, description: 'Occupant assigne' })
    async assignerOccupant(
        @Param('id', ParseUUIDPipe) id: string,
        @Body(new ValidationPipe({ transform: true })) dto: AssignerOccupantDto,
    ) {
        this.logger.log(`Assigning occupant ${dto.occupantId} to espace: ${id}`);
        await this.espaceService.assignerOccupant(id, dto.occupantId);
        return {
            success: true,
            message: 'Occupant assigne avec succes',
        };
    }

    /**
     * Libere un espace
     */
    @Put(':id/liberer')
    @Roles('ADMIN', 'SUPER_ADMIN')
    @ApiOperation({ summary: 'Liberer un espace' })
    @ApiParam({ name: 'id', description: 'UUID de l\'espace' })
    @ApiResponse({ status: 200, description: 'Espace libere' })
    async liberer(@Param('id', ParseUUIDPipe) id: string) {
        this.logger.log(`Liberating espace: ${id}`);
        await this.espaceService.liberer(id);
        return {
            success: true,
            message: 'Espace libere avec succes',
        };
    }

    /**
     * Desactive un espace
     */
    @Put(':id/desactiver')
    @Roles('ADMIN', 'SUPER_ADMIN')
    @ApiOperation({ summary: 'Desactiver un espace' })
    @ApiParam({ name: 'id', description: 'UUID de l\'espace' })
    @ApiResponse({ status: 200, description: 'Espace desactive' })
    async desactiver(@Param('id', ParseUUIDPipe) id: string) {
        this.logger.log(`Deactivating espace: ${id}`);
        await this.espaceService.desactiver(id);
        return {
            success: true,
            message: 'Espace desactive avec succes',
        };
    }

    /**
     * Reactive un espace
     */
    @Put(':id/reactiver')
    @Roles('ADMIN', 'SUPER_ADMIN')
    @ApiOperation({ summary: 'Reactiver un espace' })
    @ApiParam({ name: 'id', description: 'UUID de l\'espace' })
    @ApiResponse({ status: 200, description: 'Espace reactive' })
    async reactiver(@Param('id', ParseUUIDPipe) id: string) {
        this.logger.log(`Reactivating espace: ${id}`);
        await this.espaceService.reactiver(id);
        return {
            success: true,
            message: 'Espace reactive avec succes',
        };
    }

    /**
     * Supprime un espace
     */
    @Delete(':id')
    @Roles('SUPER_ADMIN')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Supprimer un espace' })
    @ApiParam({ name: 'id', description: 'UUID de l\'espace' })
    @ApiResponse({ status: 204, description: 'Espace supprime' })
    async delete(@Param('id', ParseUUIDPipe) id: string) {
        this.logger.log(`Deleting espace: ${id}`);
        await this.espaceService.delete(id);
    }

    /**
     * Recupere le resume des espaces
     */
    @Get('statistiques/resume')
    @Roles('ADMIN', 'SUPER_ADMIN', 'SUPERVISEUR')
    @ApiOperation({ summary: 'Resume des espaces' })
    @ApiQuery({ name: 'batimentId', required: false, description: 'Filtrer par batiment' })
    @ApiResponse({ status: 200, description: 'Resume des espaces' })
    async getResume(@Query('batimentId') batimentId?: string) {
        const resume = await this.espaceService.getResume(batimentId);
        return {
            success: true,
            data: resume,
        };
    }

    /**
     * Recupere les espaces les plus defectueux
     */
    @Get('statistiques/most-defectueux')
    @Roles('ADMIN', 'SUPER_ADMIN', 'SUPERVISEUR')
    @ApiOperation({ summary: 'Espaces les plus defectueux' })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'batimentId', required: false })
    @ApiResponse({ status: 200, description: 'Liste des espaces les plus defectueux' })
    async getMostDefectueux(
        @Query('limit') limit = 10,
        @Query('batimentId') batimentId?: string,
    ) {
        const espaces = await this.espaceService.getMostDefectueux(Number(limit), batimentId);
        return {
            success: true,
            data: espaces,
        };
    }

    /**
     * Recupere les espaces sans incident
     */
    @Get('statistiques/sans-incident')
    @Roles('ADMIN', 'SUPER_ADMIN', 'SUPERVISEUR')
    @ApiOperation({ summary: 'Espaces sans incident' })
    @ApiQuery({ name: 'batimentId', required: false })
    @ApiResponse({ status: 200, description: 'Liste des espaces sans incident' })
    async getSansIncident(@Query('batimentId') batimentId?: string) {
        const espaces = await this.espaceService.getSansIncident(batimentId);
        return {
            success: true,
            data: espaces,
            total: espaces.length,
        };
    }
}