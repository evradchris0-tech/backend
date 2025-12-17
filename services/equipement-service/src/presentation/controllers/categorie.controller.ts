import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { CategorieService } from '../../application/services';
import {
  CreateCategorieDto,
  UpdateCategorieDto,
  CategorieResponseDto,
} from '../../application/dto/categorie';

@ApiTags('Catégories')
@Controller('categories')
export class CategorieController {
  constructor(private readonly categorieService: CategorieService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle catégorie' })
  @ApiResponse({
    status: 201,
    description: 'Catégorie créée avec succès',
    type: CategorieResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  async create(
    @Body() dto: CreateCategorieDto,
  ): Promise<CategorieResponseDto> {
    return this.categorieService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les catégories' })
  @ApiResponse({
    status: 200,
    description: 'Liste des catégories',
    type: [CategorieResponseDto],
  })
  async findAll(): Promise<CategorieResponseDto[]> {
    return this.categorieService.findAll();
  }

  @Get('racines')
  @ApiOperation({ summary: 'Récupérer les catégories racines (sans parent)' })
  @ApiResponse({
    status: 200,
    type: [CategorieResponseDto],
  })
  async findRacines(): Promise<CategorieResponseDto[]> {
    return this.categorieService.findRacines();
  }

  @Get('parent/:parentId')
  @ApiOperation({ summary: 'Récupérer les sous-catégories d\'une catégorie' })
  @ApiParam({ name: 'parentId', type: 'string' })
  @ApiResponse({
    status: 200,
    type: [CategorieResponseDto],
  })
  async findByParent(
    @Param('parentId', ParseUUIDPipe) parentId: string,
  ): Promise<CategorieResponseDto[]> {
    return this.categorieService.findByParent(parentId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une catégorie par ID' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    type: CategorieResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Catégorie non trouvée' })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CategorieResponseDto> {
    return this.categorieService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour une catégorie' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Catégorie mise à jour',
    type: CategorieResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Catégorie non trouvée' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategorieDto,
  ): Promise<CategorieResponseDto> {
    return this.categorieService.update(id, dto);
  }

  @Post(':id/activer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activer une catégorie' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    type: CategorieResponseDto,
  })
  async activer(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CategorieResponseDto> {
    return this.categorieService.activer(id);
  }

  @Post(':id/desactiver')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Désactiver une catégorie' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    type: CategorieResponseDto,
  })
  async desactiver(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CategorieResponseDto> {
    return this.categorieService.desactiver(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer une catégorie' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 204, description: 'Catégorie supprimée' })
  @ApiResponse({ status: 404, description: 'Catégorie non trouvée' })
  @ApiResponse({
    status: 400,
    description: 'Impossible de supprimer (sous-catégories ou équipements associés)',
  })
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.categorieService.delete(id);
  }
}
