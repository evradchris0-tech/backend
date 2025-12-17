// src/presentation/controllers/etage.controller.ts

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
import { EtageService } from '../../application/services/etage.service';
import { CreateEtageDto, UpdateEtageDto, CreateMultipleEtagesDto } from '../../application/dtos';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';

/**
 * Controller REST pour la gestion des etages
 */
@ApiTags('Etages')
@ApiBearerAuth()
@Controller('etages')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EtageController {
    private readonly logger = new Logger(EtageController.name);

    constructor(private readonly etageService: EtageService) {}

    /**
     * Cree un nouvel etage
     */
    @Post()
    @Roles('ADMIN', 'SUPER_ADMIN')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Creer un nouvel etage' })
    @ApiResponse({ status: 201, description: 'Etage cree avec succes' })
    @ApiResponse({ status: 400, description: 'Donnees invalides' })
    @ApiResponse({ status: 409, description: 'Numero etage deja existant dans ce batiment' })
    async create(
        @Body(new ValidationPipe({ transform: true })) dto: CreateEtageDto,
    ) {
        this.logger.log(`Creating etage for batiment: ${dto.batimentId}`);
        const etage = await this.etageService.create(dto);
        return {
            success: true,
            message: 'Etage cree avec succes',
            data: etage,
        };
    }

    /**
     * Cree plusieurs etages d'un coup
     */
    @Post('multiple')
    @Roles('ADMIN', 'SUPER_ADMIN')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Creer plusieurs etages' })
    @ApiResponse({ status: 201, description: 'Etages crees avec succes' })
    async createMultiple(
        @Body(new ValidationPipe({ transform: true })) dto: CreateMultipleEtagesDto,
    ) {
        this.logger.log(`Creating ${dto.nombreEtages} etages for batiment: ${dto.batimentId}`);
        const etages = await this.etageService.createMultiple(
            dto.batimentId,
            dto.nombreEtages,
            (dto.numeroDepart ?? 0) < 0, // avecSousSol = true si numeroDepart < 0
        );
        return {
            success: true,
            message: `${etages.length} etages crees avec succes`,
            data: etages,
        };
    }

    /**
     * Recupere un etage par son ID
     */
    @Get(':id')
    @Roles('ADMIN', 'SUPER_ADMIN', 'SUPERVISEUR', 'AGENT')
    @ApiOperation({ summary: 'Recuperer un etage par ID' })
    @ApiParam({ name: 'id', description: 'UUID de l\'etage' })
    @ApiResponse({ status: 200, description: 'Etage trouve' })
    @ApiResponse({ status: 404, description: 'Etage non trouve' })
    async findById(@Param('id', ParseUUIDPipe) id: string) {
        const etage = await this.etageService.findById(id);
        return {
            success: true,
            data: etage,
        };
    }

    /**
     * Recupere un etage avec les informations du batiment parent
     */
    @Get(':id/with-batiment')
    @Roles('ADMIN', 'SUPER_ADMIN', 'SUPERVISEUR', 'AGENT')
    @ApiOperation({ summary: 'Recuperer un etage avec son batiment' })
    @ApiParam({ name: 'id', description: 'UUID de l\'etage' })
    @ApiResponse({ status: 200, description: 'Etage avec batiment' })
    async findByIdWithBatiment(@Param('id', ParseUUIDPipe) id: string) {
        const etage = await this.etageService.findById(id);
        return {
            success: true,
            data: etage,
        };
    }

    /**
     * Recupere les etages d'un batiment
     */
    @Get('batiment/:batimentId')
    @Roles('ADMIN', 'SUPER_ADMIN', 'SUPERVISEUR', 'AGENT')
    @ApiOperation({ summary: 'Lister les etages d\'un batiment' })
    @ApiParam({ name: 'batimentId', description: 'UUID du batiment' })
    @ApiResponse({ status: 200, description: 'Liste des etages' })
    async findByBatiment(@Param('batimentId', ParseUUIDPipe) batimentId: string) {
        const etages = await this.etageService.findByBatiment(batimentId);
        return {
            success: true,
            data: etages,
            total: etages.length,
        };
    }

    /**
     * Recupere un etage par batiment et numero
     */
    @Get('batiment/:batimentId/numero/:numero')
    @Roles('ADMIN', 'SUPER_ADMIN', 'SUPERVISEUR', 'AGENT')
    @ApiOperation({ summary: 'Recuperer un etage par batiment et numero' })
    @ApiParam({ name: 'batimentId', description: 'UUID du batiment' })
    @ApiParam({ name: 'numero', description: 'Numero de l\'etage' })
    @ApiResponse({ status: 200, description: 'Etage trouve' })
    @ApiResponse({ status: 404, description: 'Etage non trouve' })
    async findByBatimentAndNumero(
        @Param('batimentId', ParseUUIDPipe) batimentId: string,
        @Param('numero') numero: string,
    ) {
        const etage = await this.etageService.findByBatimentAndNumero(
            batimentId,
            parseInt(numero, 10),
        );
        return {
            success: true,
            data: etage,
        };
    }

    /**
     * Met a jour un etage
     */
    @Put(':id')
    @Roles('ADMIN', 'SUPER_ADMIN')
    @ApiOperation({ summary: 'Mettre a jour un etage' })
    @ApiParam({ name: 'id', description: 'UUID de l\'etage' })
    @ApiResponse({ status: 200, description: 'Etage mis a jour' })
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body(new ValidationPipe({ transform: true })) dto: UpdateEtageDto,
    ) {
        this.logger.log(`Updating etage: ${id}`);
        const etage = await this.etageService.update(id, dto);
        return {
            success: true,
            message: 'Etage mis a jour avec succes',
            data: etage,
        };
    }

    /**
     * Desactive un etage
     */
    @Put(':id/desactiver')
    @Roles('ADMIN', 'SUPER_ADMIN')
    @ApiOperation({ summary: 'Desactiver un etage' })
    @ApiParam({ name: 'id', description: 'UUID de l\'etage' })
    @ApiResponse({ status: 200, description: 'Etage desactive' })
    async desactiver(@Param('id', ParseUUIDPipe) id: string) {
        this.logger.log(`Deactivating etage: ${id}`);
        await this.etageService.desactiver(id);
        return {
            success: true,
            message: 'Etage desactive avec succes',
        };
    }

    /**
     * Reactive un etage
     */
    @Put(':id/reactiver')
    @Roles('ADMIN', 'SUPER_ADMIN')
    @ApiOperation({ summary: 'Reactiver un etage' })
    @ApiParam({ name: 'id', description: 'UUID de l\'etage' })
    @ApiResponse({ status: 200, description: 'Etage reactive' })
    async reactiver(@Param('id', ParseUUIDPipe) id: string) {
        this.logger.log(`Reactivating etage: ${id}`);
        await this.etageService.reactiver(id);
        return {
            success: true,
            message: 'Etage reactive avec succes',
        };
    }

    /**
     * Supprime un etage
     */
    @Delete(':id')
    @Roles('SUPER_ADMIN')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Supprimer un etage' })
    @ApiParam({ name: 'id', description: 'UUID de l\'etage' })
    @ApiResponse({ status: 204, description: 'Etage supprime' })
    async delete(@Param('id', ParseUUIDPipe) id: string) {
        this.logger.log(`Deleting etage: ${id}`);
        await this.etageService.delete(id);
    }

    /**
     * Recupere les statistiques des etages d'un batiment
     */
    @Get('batiment/:batimentId/statistiques')
    @Roles('ADMIN', 'SUPER_ADMIN', 'SUPERVISEUR')
    @ApiOperation({ summary: 'Statistiques des etages d\'un batiment' })
    @ApiParam({ name: 'batimentId', description: 'UUID du batiment' })
    @ApiResponse({ status: 200, description: 'Statistiques par etage' })
    async getStatistiquesParBatiment(
        @Param('batimentId', ParseUUIDPipe) batimentId: string,
    ) {
        const stats = await this.etageService.getStatistiquesParBatiment(batimentId);
        return {
            success: true,
            data: stats,
        };
    }
}