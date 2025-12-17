// src/presentation/controllers/batiment.controller.ts

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
import { BatimentService } from '../../application/services/batiment.service';
import {
    CreateBatimentDto,
    UpdateBatimentDto,
} from '../../application/dtos';
import { TypeBatiment } from '../../domain/enums';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';

/**
 * Controller REST pour la gestion des batiments
 * Expose les endpoints CRUD et les statistiques
 */
@ApiTags('Batiments')
@ApiBearerAuth()
@Controller('batiments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BatimentController {
    private readonly logger = new Logger(BatimentController.name);

    constructor(private readonly batimentService: BatimentService) {}

    /**
     * Cree un nouveau batiment
     */
    @Post()
    @Roles('ADMIN', 'SUPER_ADMIN')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Creer un nouveau batiment' })
    @ApiResponse({ status: 201, description: 'Batiment cree avec succes' })
    @ApiResponse({ status: 400, description: 'Donnees invalides' })
    @ApiResponse({ status: 409, description: 'Code batiment deja existant' })
    async create(
        @Body(new ValidationPipe({ transform: true })) dto: CreateBatimentDto,
    ) {
        this.logger.log(`Creating batiment: ${dto.nom}`);
        const batiment = await this.batimentService.create(dto);
        return {
            success: true,
            message: 'Batiment cree avec succes',
            data: batiment,
        };
    }

    /**
     * Recupere tous les batiments avec pagination et filtres
     */
    @Get()
    @Roles('ADMIN', 'SUPER_ADMIN', 'SUPERVISEUR', 'AGENT')
    @ApiOperation({ summary: 'Lister tous les batiments' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'type', required: false, enum: TypeBatiment })
    @ApiQuery({ name: 'actif', required: false, type: Boolean })
    @ApiQuery({ name: 'recherche', required: false, type: String })
    @ApiResponse({ status: 200, description: 'Liste des batiments' })
    async findAll(
        @Query('page') page = 1,
        @Query('limit') limit = 10,
        @Query('type') type?: TypeBatiment,
        @Query('actif') actif?: string,
        @Query('recherche') recherche?: string,
    ) {
        const filters = {
            type,
            actif: actif !== undefined ? actif === 'true' : undefined,
            rechercheTexte: recherche,
        };
        const result = await this.batimentService.findAll(
            filters,
            { page: Number(page), limit: Number(limit) },
        );
        return {
            success: true,
            ...result,
        };
    }

    /**
     * Recupere un batiment par son ID
     */
    @Get(':id')
    @Roles('ADMIN', 'SUPER_ADMIN', 'SUPERVISEUR', 'AGENT')
    @ApiOperation({ summary: 'Recuperer un batiment par ID' })
    @ApiParam({ name: 'id', description: 'UUID du batiment' })
    @ApiResponse({ status: 200, description: 'Batiment trouve' })
    @ApiResponse({ status: 404, description: 'Batiment non trouve' })
    async findById(@Param('id', ParseUUIDPipe) id: string) {
        const batiment = await this.batimentService.findById(id);
        return {
            success: true,
            data: batiment,
        };
    }

    /**
     * Recupere un batiment avec ses statistiques
     */
    @Get(':id/stats')
    @Roles('ADMIN', 'SUPER_ADMIN', 'SUPERVISEUR')
    @ApiOperation({ summary: 'Recuperer un batiment avec statistiques' })
    @ApiParam({ name: 'id', description: 'UUID du batiment' })
    @ApiResponse({ status: 200, description: 'Batiment avec statistiques' })
    async findByIdWithStats(@Param('id', ParseUUIDPipe) id: string) {
        const batiment = await this.batimentService.findByIdWithStats(id);
        return {
            success: true,
            data: batiment,
        };
    }

    /**
     * Recupere un batiment par son code
     */
    @Get('code/:code')
    @Roles('ADMIN', 'SUPER_ADMIN', 'SUPERVISEUR', 'AGENT')
    @ApiOperation({ summary: 'Recuperer un batiment par code' })
    @ApiParam({ name: 'code', description: 'Code unique du batiment' })
    @ApiResponse({ status: 200, description: 'Batiment trouve' })
    @ApiResponse({ status: 404, description: 'Batiment non trouve' })
    async findByCode(@Param('code') code: string) {
        const batiment = await this.batimentService.findByCode(code);
        return {
            success: true,
            data: batiment,
        };
    }

    /**
     * Met a jour un batiment
     */
    @Put(':id')
    @Roles('ADMIN', 'SUPER_ADMIN')
    @ApiOperation({ summary: 'Mettre a jour un batiment' })
    @ApiParam({ name: 'id', description: 'UUID du batiment' })
    @ApiResponse({ status: 200, description: 'Batiment mis a jour' })
    @ApiResponse({ status: 404, description: 'Batiment non trouve' })
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body(new ValidationPipe({ transform: true })) dto: UpdateBatimentDto,
    ) {
        this.logger.log(`Updating batiment: ${id}`);
        const batiment = await this.batimentService.update(id, dto);
        return {
            success: true,
            message: 'Batiment mis a jour avec succes',
            data: batiment,
        };
    }

    /**
     * Desactive un batiment
     */
    @Put(':id/desactiver')
    @Roles('ADMIN', 'SUPER_ADMIN')
    @ApiOperation({ summary: 'Desactiver un batiment' })
    @ApiParam({ name: 'id', description: 'UUID du batiment' })
    @ApiResponse({ status: 200, description: 'Batiment desactive' })
    async desactiver(@Param('id', ParseUUIDPipe) id: string) {
        this.logger.log(`Deactivating batiment: ${id}`);
        await this.batimentService.desactiver(id);
        return {
            success: true,
            message: 'Batiment desactive avec succes',
        };
    }

    /**
     * Reactive un batiment
     */
    @Put(':id/reactiver')
    @Roles('ADMIN', 'SUPER_ADMIN')
    @ApiOperation({ summary: 'Reactiver un batiment' })
    @ApiParam({ name: 'id', description: 'UUID du batiment' })
    @ApiResponse({ status: 200, description: 'Batiment reactive' })
    async reactiver(@Param('id', ParseUUIDPipe) id: string) {
        this.logger.log(`Reactivating batiment: ${id}`);
        await this.batimentService.reactiver(id);
        return {
            success: true,
            message: 'Batiment reactive avec succes',
        };
    }

    /**
     * Supprime un batiment
     */
    @Delete(':id')
    @Roles('SUPER_ADMIN')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Supprimer un batiment' })
    @ApiParam({ name: 'id', description: 'UUID du batiment' })
    @ApiResponse({ status: 204, description: 'Batiment supprime' })
    @ApiResponse({ status: 404, description: 'Batiment non trouve' })
    async delete(@Param('id', ParseUUIDPipe) id: string) {
        this.logger.log(`Deleting batiment: ${id}`);
        await this.batimentService.delete(id);
    }

    /**
     * Recupere les statistiques globales de tous les batiments
     */
    @Get('statistiques/globales')
    @Roles('ADMIN', 'SUPER_ADMIN', 'SUPERVISEUR')
    @ApiOperation({ summary: 'Recuperer les statistiques globales' })
    @ApiResponse({ status: 200, description: 'Statistiques globales' })
    async getStatistiquesGlobales() {
        const stats = await this.batimentService.getStatistiquesGlobales();
        return {
            success: true,
            data: stats,
        };
    }

    /**
     * Genere un code unique pour un nouveau batiment
     */
    @Get('generate/code')
    @Roles('ADMIN', 'SUPER_ADMIN')
    @ApiOperation({ summary: 'Generer un code unique' })
    @ApiQuery({ name: 'type', required: true, enum: TypeBatiment })
    @ApiResponse({ status: 200, description: 'Code genere' })
    async generateCode(@Query('type') type: TypeBatiment) {
        const code = await this.batimentService.generateCode(type);
        return {
            success: true,
            data: { code },
        };
    }
}