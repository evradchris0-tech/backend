import { Injectable, NotFoundException, Inject, BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { ICategorieRepository } from '../../domain';
import {
  CreateCategorieDto,
  UpdateCategorieDto,
  CategorieResponseDto,
} from '../dto/categorie';
import { CategorieMapper } from '../mappers';

@Injectable()
export class CategorieService {
  constructor(
    @Inject('ICategorieRepository')
    private readonly categorieRepository: ICategorieRepository,
  ) {}

  async create(dto: CreateCategorieDto): Promise<CategorieResponseDto> {
    const existing = await this.categorieRepository.findByCode(dto.code);
    if (existing) {
      throw new BadRequestException(`Code ${dto.code} déjà utilisé`);
    }

    const id = uuidv4();
    const categorie = CategorieMapper.toDomain(id, dto);
    const saved = await this.categorieRepository.save(categorie);

    return CategorieMapper.toDto(saved);
  }

  async findById(id: string): Promise<CategorieResponseDto> {
    const categorie = await this.categorieRepository.findById(id);
    if (!categorie) {
      throw new NotFoundException(`Catégorie avec ID ${id} non trouvée`);
    }
    return CategorieMapper.toDto(categorie);
  }

  async findAll(): Promise<CategorieResponseDto[]> {
    const categories = await this.categorieRepository.findAll();
    return CategorieMapper.toDtoList(categories);
  }

  async findRacines(): Promise<CategorieResponseDto[]> {
    const categories = await this.categorieRepository.findRacines();
    return CategorieMapper.toDtoList(categories);
  }

  async findByParent(parentId: string): Promise<CategorieResponseDto[]> {
    const categories = await this.categorieRepository.findByParent(parentId);
    return CategorieMapper.toDtoList(categories);
  }

  async update(
    id: string,
    dto: UpdateCategorieDto,
  ): Promise<CategorieResponseDto> {
    const categorie = await this.categorieRepository.findById(id);
    if (!categorie) {
      throw new NotFoundException(`Catégorie avec ID ${id} non trouvée`);
    }

    categorie.mettreAJour({
      libelle: dto.libelle,
      description: dto.description,
      categorieParentId: dto.categorieParentId,
    });

    const updated = await this.categorieRepository.save(categorie);
    return CategorieMapper.toDto(updated);
  }

  async activer(id: string): Promise<CategorieResponseDto> {
    const categorie = await this.categorieRepository.findById(id);
    if (!categorie) {
      throw new NotFoundException(`Catégorie avec ID ${id} non trouvée`);
    }

    categorie.activer();
    const updated = await this.categorieRepository.save(categorie);
    return CategorieMapper.toDto(updated);
  }

  async desactiver(id: string): Promise<CategorieResponseDto> {
    const categorie = await this.categorieRepository.findById(id);
    if (!categorie) {
      throw new NotFoundException(`Catégorie avec ID ${id} non trouvée`);
    }

    categorie.desactiver();
    const updated = await this.categorieRepository.save(categorie);
    return CategorieMapper.toDto(updated);
  }

  async delete(id: string): Promise<void> {
    const categorie = await this.categorieRepository.findById(id);
    if (!categorie) {
      throw new NotFoundException(`Catégorie avec ID ${id} non trouvée`);
    }

    const hasEnfants = await this.categorieRepository.hasEnfants(id);
    if (hasEnfants) {
      throw new BadRequestException(
        'Impossible de supprimer une catégorie ayant des sous-catégories',
      );
    }

    const hasEquipements = await this.categorieRepository.hasEquipements(id);
    if (hasEquipements) {
      throw new BadRequestException(
        'Impossible de supprimer une catégorie ayant des équipements associés',
      );
    }

    await this.categorieRepository.delete(id);
  }
}
