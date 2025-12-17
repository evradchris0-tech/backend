import { CategorieEquipement } from '../../../domain/entities';
import { CategorieOrmEntity } from '../entities';

export class CategorieOrmMapper {
  static toDomain(ormEntity: CategorieOrmEntity): CategorieEquipement {
    return new CategorieEquipement({
      id: ormEntity.id,
      code: ormEntity.code,
      libelle: ormEntity.libelle,
      description: ormEntity.description,
      categorieParentId: ormEntity.categorieParentId,
      estActif: ormEntity.estActif,
      createdAt: ormEntity.createdAt,
      updatedAt: ormEntity.updatedAt,
    });
  }

  static toOrm(domain: CategorieEquipement): CategorieOrmEntity {
    const ormEntity = new CategorieOrmEntity();

    ormEntity.id = domain.id;
    ormEntity.code = domain.code;
    ormEntity.libelle = domain.libelle;
    ormEntity.description = domain.description;
    ormEntity.categorieParentId = domain.categorieParentId;
    ormEntity.estActif = domain.estActif;
    ormEntity.createdAt = domain.createdAt;
    ormEntity.updatedAt = domain.updatedAt;

    return ormEntity;
  }

  static toDomainList(ormEntities: CategorieOrmEntity[]): CategorieEquipement[] {
    return ormEntities.map((e) => this.toDomain(e));
  }
}
