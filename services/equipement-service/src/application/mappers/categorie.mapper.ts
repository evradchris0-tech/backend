import { CategorieEquipement } from '../../domain/entities';
import {
  CreateCategorieDto,
  CategorieResponseDto,
} from '../dto/categorie';

export class CategorieMapper {
  static toDomain(
    id: string,
    dto: CreateCategorieDto,
  ): CategorieEquipement {
    return new CategorieEquipement({
      id,
      code: dto.code,
      libelle: dto.libelle,
      description: dto.description,
      categorieParentId: dto.categorieParentId,
    });
  }

  static toDto(categorie: CategorieEquipement): CategorieResponseDto {
    return {
      id: categorie.id,
      code: categorie.code,
      libelle: categorie.libelle,
      description: categorie.description,
      categorieParentId: categorie.categorieParentId,
      estActif: categorie.estActif,
      isRacine: categorie.isRacine(),
      isSousCategorie: categorie.isSousCategorie(),
      createdAt: categorie.createdAt,
      updatedAt: categorie.updatedAt,
    };
  }

  static toDtoList(categories: CategorieEquipement[]): CategorieResponseDto[] {
    return categories.map((cat) => this.toDto(cat));
  }
}
