import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { ICategorieRepository } from '../../../domain/repositories';
import { CategorieEquipement } from '../../../domain/entities';
import { CategorieOrmEntity, EquipementOrmEntity } from '../entities';
import { CategorieOrmMapper } from '../mappers';

@Injectable()
export class CategorieRepository implements ICategorieRepository {
  constructor(
    @InjectRepository(CategorieOrmEntity)
    private readonly ormRepository: Repository<CategorieOrmEntity>,
    @InjectRepository(EquipementOrmEntity)
    private readonly equipementRepository: Repository<EquipementOrmEntity>,
  ) {}

  async findById(id: string): Promise<CategorieEquipement | null> {
    const ormEntity = await this.ormRepository.findOne({ where: { id } });
    return ormEntity ? CategorieOrmMapper.toDomain(ormEntity) : null;
  }

  async findAll(): Promise<CategorieEquipement[]> {
    const ormEntities = await this.ormRepository.find({
      order: { libelle: 'ASC' },
    });
    return CategorieOrmMapper.toDomainList(ormEntities);
  }

  async save(entity: CategorieEquipement): Promise<CategorieEquipement> {
    const ormEntity = CategorieOrmMapper.toOrm(entity);
    const saved = await this.ormRepository.save(ormEntity);
    return CategorieOrmMapper.toDomain(saved);
  }

  async delete(id: string): Promise<void> {
    await this.ormRepository.delete(id);
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.ormRepository.count({ where: { id } });
    return count > 0;
  }

  async count(): Promise<number> {
    return this.ormRepository.count();
  }

  async findByCode(code: string): Promise<CategorieEquipement | null> {
    const ormEntity = await this.ormRepository.findOne({ where: { code } });
    return ormEntity ? CategorieOrmMapper.toDomain(ormEntity) : null;
  }

  async findRacines(): Promise<CategorieEquipement[]> {
    const ormEntities = await this.ormRepository.find({
      where: { categorieParentId: IsNull() },
      order: { libelle: 'ASC' },
    });
    return CategorieOrmMapper.toDomainList(ormEntities);
  }

  async findByParent(categorieParentId: string): Promise<CategorieEquipement[]> {
    const ormEntities = await this.ormRepository.find({
      where: { categorieParentId },
      order: { libelle: 'ASC' },
    });
    return CategorieOrmMapper.toDomainList(ormEntities);
  }

  async findActives(): Promise<CategorieEquipement[]> {
    const ormEntities = await this.ormRepository.find({
      where: { estActif: true },
      order: { libelle: 'ASC' },
    });
    return CategorieOrmMapper.toDomainList(ormEntities);
  }

  async hasEnfants(categorieId: string): Promise<boolean> {
    const count = await this.ormRepository.count({
      where: { categorieParentId: categorieId },
    });
    return count > 0;
  }

  async hasEquipements(categorieId: string): Promise<boolean> {
    const count = await this.equipementRepository.count({
      where: { categorieId },
    });
    return count > 0;
  }

  async search(terme: string): Promise<CategorieEquipement[]> {
    const ormEntities = await this.ormRepository
      .createQueryBuilder('categorie')
      .where('categorie.code ILIKE :terme', { terme: `%${terme}%` })
      .orWhere('categorie.libelle ILIKE :terme', { terme: `%${terme}%` })
      .orderBy('categorie.libelle', 'ASC')
      .getMany();

    return CategorieOrmMapper.toDomainList(ormEntities);
  }
}
