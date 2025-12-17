import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { EquipementService, StockService } from '../../application/services';
import {
  CreateEquipementDto,
  UpdateEquipementDto,
  EquipementResponseDto,
  EquipementListResponseDto,
  AjusterStockDto,
} from '../../application/dto/equipement';

@ApiTags('Équipements')
@Controller('equipements')
export class EquipementController {
  constructor(
    private readonly equipementService: EquipementService,
    private readonly stockService: StockService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouvel équipement' })
  @ApiResponse({
    status: 201,
    description: 'Équipement créé avec succès',
    type: EquipementResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  async create(
    @Body() dto: CreateEquipementDto,
  ): Promise<EquipementResponseDto> {
    return this.equipementService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les équipements' })
  @ApiResponse({
    status: 200,
    description: 'Liste des équipements',
    type: [EquipementResponseDto],
  })
  async findAll(): Promise<EquipementResponseDto[]> {
    return this.equipementService.findAll();
  }

  @Get('stock-faible')
  @ApiOperation({ summary: 'Récupérer les équipements en stock faible' })
  @ApiResponse({
    status: 200,
    type: [EquipementResponseDto],
  })
  async findStockFaible(): Promise<EquipementResponseDto[]> {
    return this.equipementService.findStockFaible();
  }

  @Get('disponibles')
  @ApiOperation({ summary: 'Récupérer les équipements disponibles' })
  @ApiResponse({
    status: 200,
    type: [EquipementResponseDto],
  })
  async findDisponibles(): Promise<EquipementResponseDto[]> {
    return this.equipementService.findDisponibles();
  }

  @Get('search')
  @ApiOperation({ summary: 'Rechercher des équipements' })
  @ApiQuery({
    name: 'q',
    description: 'Terme de recherche',
    required: true,
  })
  @ApiResponse({
    status: 200,
    type: [EquipementResponseDto],
  })
  async search(@Query('q') terme: string): Promise<EquipementResponseDto[]> {
    return this.equipementService.search(terme);
  }

  @Get('categorie/:categorieId')
  @ApiOperation({ summary: 'Récupérer les équipements par catégorie' })
  @ApiParam({ name: 'categorieId', type: 'string' })
  @ApiResponse({
    status: 200,
    type: [EquipementResponseDto],
  })
  async findByCategorie(
    @Param('categorieId', ParseUUIDPipe) categorieId: string,
  ): Promise<EquipementResponseDto[]> {
    return this.equipementService.findByCategorie(categorieId);
  }

  @Get('reference/:reference')
  @ApiOperation({ summary: 'Récupérer un équipement par référence' })
  @ApiParam({ name: 'reference', type: 'string' })
  @ApiResponse({
    status: 200,
    type: EquipementResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Équipement non trouvé' })
  async findByReference(
    @Param('reference') reference: string,
  ): Promise<EquipementResponseDto> {
    return this.equipementService.findByReference(reference);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un équipement par ID' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    type: EquipementResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Équipement non trouvé' })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<EquipementResponseDto> {
    return this.equipementService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour un équipement' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Équipement mis à jour',
    type: EquipementResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Équipement non trouvé' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEquipementDto,
  ): Promise<EquipementResponseDto> {
    return this.equipementService.update(id, dto);
  }

  @Post(':id/stock/ajouter')
  @ApiOperation({ summary: 'Ajouter du stock' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    type: EquipementResponseDto,
  })
  async ajouterStock(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AjusterStockDto,
  ): Promise<EquipementResponseDto> {
    return this.stockService.ajouterStock(id, dto);
  }

  @Post(':id/stock/retirer')
  @ApiOperation({ summary: 'Retirer du stock' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    type: EquipementResponseDto,
  })
  async retirerStock(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AjusterStockDto,
  ): Promise<EquipementResponseDto> {
    return this.stockService.retirerStock(id, dto);
  }

  @Post(':id/panne')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enregistrer une panne' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    type: EquipementResponseDto,
  })
  async enregistrerPanne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<EquipementResponseDto> {
    return this.equipementService.enregistrerPanne(id);
  }

  @Post(':id/maintenance/terminer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Terminer la maintenance' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    type: EquipementResponseDto,
  })
  async finirMaintenance(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<EquipementResponseDto> {
    return this.equipementService.finirMaintenance(id);
  }

  @Post(':id/hors-service')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Marquer comme hors service' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    type: EquipementResponseDto,
  })
  async marquerHorsService(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('motif') motif?: string,
  ): Promise<EquipementResponseDto> {
    return this.equipementService.marquerHorsService(id, motif);
  }

  @Post(':id/obsolete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Marquer comme obsolète' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    type: EquipementResponseDto,
  })
  async marquerObsolete(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('motif') motif?: string,
  ): Promise<EquipementResponseDto> {
    return this.equipementService.marquerObsolete(id, motif);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer un équipement' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 204, description: 'Équipement supprimé' })
  @ApiResponse({ status: 404, description: 'Équipement non trouvé' })
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.equipementService.delete(id);
  }
}
