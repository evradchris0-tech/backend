// src/presentation/controllers/equipement.controller.ts

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
import { EquipementService } from '../../application/services/equipement.service';
import {
    CreateEquipementDto,
    UpdateEquipementDto,
    CreateEquipementsLotDto,
    CreateKitChambreDto,
    ChangeStatutEquipementDto,
    AssignerEquipementDto,
} from '../../application/dtos';
import { TypeEquipement, StatutEquipement } from '../../domain/enums';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';

/**
 * Controller REST pour la gestion des equipements
 */
@ApiTags('Equipements')
@ApiBearerAuth()
@Controller('equipements')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EquipementController {
    private readonly logger = new Logger(EquipementController.name);

    constructor(private readonly equipementService: EquipementService) {}

    /**
     * Cree un nouvel equipement
     */
    @Post()
    @Roles('ADMIN', 'SUPER_ADMIN')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Creer un nouvel equipement' })
    @ApiResponse({ status: 201, description: 'Equipement cree avec succes' })
    @ApiResponse({ status: 400, description: 'Donnees invalides' })
    @ApiResponse({ status: 409, description: 'Numero de serie deja existant' })
    async create(
        @Body(new ValidationPipe({ transform: true })) dto: CreateEquipementDto,
    ) {
        this.logger.log(`Creating equipement: ${dto.type}`);
        const equipement = await this.equipementService.create(dto);
        return {
            success: true,
            message: 'Equipement cree avec succes',
            data: equipement,
        };
    }

    /**
     * Cree un lot d'equipements identiques
     */
    @Post('lot')
    @Roles('ADMIN', 'SUPER_ADMIN')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Creer un lot d\'equipements' })
    @ApiResponse({ status: 201, description: 'Equipements crees avec succes' })
    async createLot(
        @Body(new ValidationPipe({ transform: true })) dto: CreateEquipementsLotDto,
    ) {
        this.logger.log(`Creating ${dto.quantite} equipements of type: ${dto.type}`);
        const equipements = await this.equipementService.createLot(
            dto.type,
            dto.quantite,
            dto.marque,
            dto.modele,
        );
        return {
            success: true,
            message: `${equipements.length} equipements crees avec succes`,
            data: equipements,
        };
    }

    /**
     * Cree un kit standard pour une chambre
     */
    @Post('kit-chambre')
    @Roles('ADMIN', 'SUPER_ADMIN')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Creer un kit chambre standard' })
    @ApiResponse({ status: 201, description: 'Kit chambre cree avec succes' })
    async createKitChambre(
        @Body(new ValidationPipe({ transform: true })) dto: CreateKitChambreDto,
    ) {
        this.logger.log(`Creating kit chambre for espace: ${dto.espaceId}`);
        const equipements = await this.equipementService.createKitChambre(dto.espaceId);
        return {
            success: true,
            message: `Kit chambre cree avec ${equipements.length} equipements`,
            data: equipements,
        };
    }

    /**
     * Recupere un equipement par son ID
     */
    @Get(':id')
    @Roles('ADMIN', 'SUPER_ADMIN', 'SUPERVISEUR', 'AGENT')
    @ApiOperation({ summary: 'Recuperer un equipement par ID' })
    @ApiParam({ name: 'id', description: 'UUID de l\'equipement' })
    @ApiResponse({ status: 200, description: 'Equipement trouve' })
    @ApiResponse({ status: 404, description: 'Equipement non trouve' })
    async findById(@Param('id', ParseUUIDPipe) id: string) {
        const equipement = await this.equipementService.findById(id);
        return {
            success: true,
            data: equipement,
        };
    }

    /**
     * Recupere un equipement avec sa localisation complete
     */
    @Get(':id/localisation')
    @Roles('ADMIN', 'SUPER_ADMIN', 'SUPERVISEUR', 'AGENT')
    @ApiOperation({ summary: 'Recuperer un equipement avec localisation' })
    @ApiParam({ name: 'id', description: 'UUID de l\'equipement' })
    @ApiResponse({ status: 200, description: 'Equipement avec localisation' })
    async findByIdWithLocalisation(@Param('id', ParseUUIDPipe) id: string) {
        const equipement = await this.equipementService.findByIdWithLocalisation(id);
        return {
            success: true,
            data: equipement,
        };
    }

    /**
     * Recupere les equipements d'un espace
     */
    @Get('espace/:espaceId')
    @Roles('ADMIN', 'SUPER_ADMIN', 'SUPERVISEUR', 'AGENT')
    @ApiOperation({ summary: 'Lister les equipements d\'un espace' })
    @ApiParam({ name: 'espaceId', description: 'UUID de l\'espace' })
    @ApiResponse({ status: 200, description: 'Liste des equipements' })
    async findByEspace(@Param('espaceId', ParseUUIDPipe) espaceId: string) {
        const equipements = await this.equipementService.findByEspace(espaceId);
        return {
            success: true,
            data: equipements,
            total: equipements.length,
        };
    }

    /**
     * Recupere les equipements d'un batiment
     */
    @Get('batiment/:batimentId')
    @Roles('ADMIN', 'SUPER_ADMIN', 'SUPERVISEUR', 'AGENT')
    @ApiOperation({ summary: 'Lister les equipements d\'un batiment' })
    @ApiParam({ name: 'batimentId', description: 'UUID du batiment' })
    @ApiResponse({ status: 200, description: 'Liste des equipements' })
    async findByBatiment(@Param('batimentId', ParseUUIDPipe) batimentId: string) {
        const equipements = await this.equipementService.findByBatiment(batimentId);
        return {
            success: true,
            data: equipements,
            total: equipements.length,
        };
    }

    /**
     * Recupere les equipements defectueux
     */
    @Get('status/defectueux')
    @Roles('ADMIN', 'SUPER_ADMIN', 'SUPERVISEUR', 'AGENT')
    @ApiOperation({ summary: 'Lister les equipements defectueux' })
    @ApiResponse({ status: 200, description: 'Liste des equipements defectueux' })
    async findDefectueux() {
        const equipements = await this.equipementService.findDefectueux();
        return {
            success: true,
            data: equipements,
            total: equipements.length,
        };
    }

    /**
     * Recupere les equipements a remplacer
     */
    @Get('status/a-remplacer')
    @Roles('ADMIN', 'SUPER_ADMIN', 'SUPERVISEUR')
    @ApiOperation({ summary: 'Lister les equipements a remplacer' })
    @ApiResponse({ status: 200, description: 'Liste des equipements a remplacer' })
    async findARemplacer() {
        const equipements = await this.equipementService.findARemplacer();
        return {
            success: true,
            data: equipements,
            total: equipements.length,
        };
    }

    /**
     * Recupere les equipements non assignes
     */
    @Get('status/non-assignes')
    @Roles('ADMIN', 'SUPER_ADMIN')
    @ApiOperation({ summary: 'Lister les equipements non assignes' })
    @ApiResponse({ status: 200, description: 'Liste des equipements non assignes' })
    async findNonAssignes() {
        const equipements = await this.equipementService.findNonAssignes();
        return {
            success: true,
            data: equipements,
            total: equipements.length,
        };
    }

    /**
     * Met a jour un equipement
     */
    @Put(':id')
    @Roles('ADMIN', 'SUPER_ADMIN')
    @ApiOperation({ summary: 'Mettre a jour un equipement' })
    @ApiParam({ name: 'id', description: 'UUID de l\'equipement' })
    @ApiResponse({ status: 200, description: 'Equipement mis a jour' })
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body(new ValidationPipe({ transform: true })) dto: UpdateEquipementDto,
    ) {
        this.logger.log(`Updating equipement: ${id}`);
        const equipement = await this.equipementService.update(id, dto);
        return {
            success: true,
            message: 'Equipement mis a jour avec succes',
            data: equipement,
        };
    }

    /**
     * Change le statut d'un equipement
     */
    @Put(':id/statut')
    @Roles('ADMIN', 'SUPER_ADMIN', 'SUPERVISEUR', 'AGENT')
    @ApiOperation({ summary: 'Changer le statut d\'un equipement' })
    @ApiParam({ name: 'id', description: 'UUID de l\'equipement' })
    @ApiResponse({ status: 200, description: 'Statut modifie' })
    async changeStatut(
        @Param('id', ParseUUIDPipe) id: string,
        @Body(new ValidationPipe({ transform: true })) dto: ChangeStatutEquipementDto,
        @CurrentUser() user: { userId: string },
    ) {
        this.logger.log(`Changing statut of equipement ${id} to ${dto.nouveauStatut}`);
        await this.equipementService.changeStatut(id, dto, user.userId);
        return {
            success: true,
            message: 'Statut modifie avec succes',
        };
    }

    /**
     * Assigne un equipement a un espace
     */
    @Put(':id/assigner')
    @Roles('ADMIN', 'SUPER_ADMIN')
    @ApiOperation({ summary: 'Assigner un equipement a un espace' })
    @ApiParam({ name: 'id', description: 'UUID de l\'equipement' })
    @ApiResponse({ status: 200, description: 'Equipement assigne' })
    async assignerAEspace(
        @Param('id', ParseUUIDPipe) id: string,
        @Body(new ValidationPipe({ transform: true })) dto: AssignerEquipementDto,
    ) {
        this.logger.log(`Assigning equipement ${id} to espace: ${dto.espaceId}`);
        await this.equipementService.assignerAEspace(id, dto.espaceId);
        return {
            success: true,
            message: 'Equipement assigne avec succes',
        };
    }

    /**
     * Retire un equipement de son espace
     */
    @Put(':id/retirer')
    @Roles('ADMIN', 'SUPER_ADMIN')
    @ApiOperation({ summary: 'Retirer un equipement de son espace' })
    @ApiParam({ name: 'id', description: 'UUID de l\'equipement' })
    @ApiResponse({ status: 200, description: 'Equipement retire' })
    async retirerDeEspace(@Param('id', ParseUUIDPipe) id: string) {
        this.logger.log(`Removing equipement ${id} from espace`);
        await this.equipementService.retirerDeEspace(id);
        return {
            success: true,
            message: 'Equipement retire avec succes',
        };
    }

    /**
     * Desactive un equipement
     */
    @Put(':id/desactiver')
    @Roles('ADMIN', 'SUPER_ADMIN')
    @ApiOperation({ summary: 'Desactiver un equipement' })
    @ApiParam({ name: 'id', description: 'UUID de l\'equipement' })
    @ApiResponse({ status: 200, description: 'Equipement desactive' })
    async desactiver(@Param('id', ParseUUIDPipe) id: string) {
        this.logger.log(`Deactivating equipement: ${id}`);
        await this.equipementService.desactiver(id);
        return {
            success: true,
            message: 'Equipement desactive avec succes',
        };
    }

    /**
     * Supprime un equipement
     */
    @Delete(':id')
    @Roles('SUPER_ADMIN')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Supprimer un equipement' })
    @ApiParam({ name: 'id', description: 'UUID de l\'equipement' })
    @ApiResponse({ status: 204, description: 'Equipement supprime' })
    async delete(@Param('id', ParseUUIDPipe) id: string) {
        this.logger.log(`Deleting equipement: ${id}`);
        await this.equipementService.delete(id);
    }

    /**
     * Recupere le resume des equipements
     */
    @Get('statistiques/resume')
    @Roles('ADMIN', 'SUPER_ADMIN', 'SUPERVISEUR')
    @ApiOperation({ summary: 'Resume des equipements' })
    @ApiQuery({ name: 'batimentId', required: false })
    @ApiResponse({ status: 200, description: 'Resume des equipements' })
    async getResume(@Query('batimentId') batimentId?: string) {
        const resume = await this.equipementService.getResume(batimentId);
        return {
            success: true,
            data: resume,
        };
    }

    /**
     * Recupere les equipements a haut risque
     */
    @Get('predictions/haut-risque')
    @Roles('ADMIN', 'SUPER_ADMIN', 'SUPERVISEUR')
    @ApiOperation({ summary: 'Equipements a haut risque' })
    @ApiQuery({ name: 'seuilScore', required: false, type: Number })
    @ApiResponse({ status: 200, description: 'Liste des equipements a risque' })
    async findHautRisque(@Query('seuilScore') seuilScore = 70) {
        const equipements = await this.equipementService.findHautRisque(Number(seuilScore));
        return {
            success: true,
            data: equipements,
            total: equipements.length,
        };
    }

    /**
     * Recupere les equipements vieillissants
     */
    @Get('predictions/vieillissants')
    @Roles('ADMIN', 'SUPER_ADMIN', 'SUPERVISEUR')
    @ApiOperation({ summary: 'Equipements vieillissants' })
    @ApiQuery({ name: 'pourcentageVieMax', required: false, type: Number })
    @ApiResponse({ status: 200, description: 'Liste des equipements vieillissants' })
    async findVieillissants(@Query('pourcentageVieMax') pourcentageVieMax = 20) {
        const equipements = await this.equipementService.findVieillissants(Number(pourcentageVieMax));
        return {
            success: true,
            data: equipements,
            total: equipements.length,
        };
    }

    /**
     * Recupere la prediction de maintenance pour un equipement
     */
    @Get(':id/prediction')
    @Roles('ADMIN', 'SUPER_ADMIN', 'SUPERVISEUR')
    @ApiOperation({ summary: 'Prediction de maintenance' })
    @ApiParam({ name: 'id', description: 'UUID de l\'equipement' })
    @ApiResponse({ status: 200, description: 'Prediction de maintenance' })
    async getPrediction(@Param('id', ParseUUIDPipe) id: string) {
        const prediction = await this.equipementService.getPrediction(id);
        return {
            success: true,
            data: prediction,
        };
    }

    /**
     * Recupere les predictions globales
     */
    @Get('predictions/globales')
    @Roles('ADMIN', 'SUPER_ADMIN', 'SUPERVISEUR')
    @ApiOperation({ summary: 'Predictions globales de maintenance' })
    @ApiQuery({ name: 'seuilScore', required: false, type: Number })
    @ApiResponse({ status: 200, description: 'Liste des predictions' })
    async getPredictionsGlobales(@Query('seuilScore') seuilScore = 50) {
        const predictions = await this.equipementService.getPredictionsGlobales(Number(seuilScore));
        return {
            success: true,
            data: predictions,
            total: predictions.length,
        };
    }
}