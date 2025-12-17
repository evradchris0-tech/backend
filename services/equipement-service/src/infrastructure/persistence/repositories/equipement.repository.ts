import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { IEquipementRepository } from '../../../domain/repositories';
import { Equipement } from '../../../domain/entities';
import { StatutEquipement, TypeEquipement } from '../../../domain/enums';
import { EquipementOrmEntity } from '../entities';
import { EquipementOrmMapper } from '../mappers';

@Injectable()
export class EquipementRepository implements IEquipementRepository {
  constructor(
    @InjectRepository(EquipementOrmEntity)
    private readonly ormRepository: Repository<EquipementOrmEntity>,
  ) {}

  async findById(id: string): Promise<Equipement | null> {
    const ormEntity = await this.ormRepository.findOne({ where: { id } });
    return ormEntity ? EquipementOrmMapper.toDomain(ormEntity) : null;
  }

  async findAll(): Promise<Equipement[]> {
    const ormEntities = await this.ormRepository.find({
      order: { createdAt: 'DESC' },
    });
    return EquipementOrmMapper.toDomainList(ormEntities);
  }

  async save(entity: Equipement): Promise<Equipement> {
    const ormEntity = EquipementOrmMapper.toOrm(entity);
    const saved = await this.ormRepository.save(ormEntity);
    return EquipementOrmMapper.toDomain(saved);
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

  async findByReference(reference: string): Promise<Equipement | null> {
    const ormEntity = await this.ormRepository.findOne({
      where: { reference },
    });
    return ormEntity ? EquipementOrmMapper.toDomain(ormEntity) : null;
  }

  async findByNumeroSerie(numeroSerie: string): Promise<Equipement | null> {
    const ormEntity = await this.ormRepository.findOne({
      where: { numeroSerie },
    });
    return ormEntity ? EquipementOrmMapper.toDomain(ormEntity) : null;
  }

  async findByCategorie(categorieId: string): Promise<Equipement[]> {
    const ormEntities = await this.ormRepository.find({
      where: { categorieId },
      order: { designation: 'ASC' },
    });
    return EquipementOrmMapper.toDomainList(ormEntities);
  }

  async findByType(type: TypeEquipement): Promise<Equipement[]> {
    const ormEntities = await this.ormRepository.find({
      where: { typeEquipement: type },
      order: { designation: 'ASC' },
    });
    return EquipementOrmMapper.toDomainList(ormEntities);
  }

  async findByStatut(statut: StatutEquipement): Promise<Equipement[]> {
    const ormEntities = await this.ormRepository.find({
      where: { statut },
      order: { designation: 'ASC' },
    });
    return EquipementOrmMapper.toDomainList(ormEntities);
  }

  async findByFournisseur(fournisseurId: string): Promise<Equipement[]> {
    const ormEntities = await this.ormRepository.find({
      where: { fournisseurId },
      order: { dateAcquisition: 'DESC' },
    });
    return EquipementOrmMapper.toDomainList(ormEntities);
  }

  async findStockFaible(): Promise<Equipement[]> {
    const ormEntities = await this.ormRepository
      .createQueryBuilder('equipement')
      .where('equipement.quantite_stock <= equipement.quantite_minimale')
      .andWhere('equipement.statut != :statut', {
        statut: StatutEquipement.OBSOLETE,
      })
      .orderBy('equipement.quantite_stock', 'ASC')
      .getMany();

    return EquipementOrmMapper.toDomainList(ormEntities);
  }

  async findEpuises(): Promise<Equipement[]> {
    const ormEntities = await this.ormRepository.find({
      where: { statut: StatutEquipement.EPUISE },
      order: { updatedAt: 'DESC' },
    });
    return EquipementOrmMapper.toDomainList(ormEntities);
  }

  async findDisponibles(): Promise<Equipement[]> {
    const ormEntities = await this.ormRepository
      .createQueryBuilder('equipement')
      .where('equipement.quantite_stock - equipement.quantite_reservee > 0')
      .andWhere('equipement.statut NOT IN (:...statuts)', {
        statuts: [
          StatutEquipement.HORS_SERVICE,
          StatutEquipement.OBSOLETE,
          StatutEquipement.EPUISE,
        ],
      })
      .orderBy('equipement.designation', 'ASC')
      .getMany();

    return EquipementOrmMapper.toDomainList(ormEntities);
  }

  async findByEspaceStockage(espaceId: string): Promise<Equipement[]> {
    const ormEntities = await this.ormRepository.find({
      where: { espaceStockageId: espaceId },
      order: { designation: 'ASC' },
    });
    return EquipementOrmMapper.toDomainList(ormEntities);
  }

  async search(terme: string): Promise<Equipement[]> {
    const ormEntities = await this.ormRepository
      .createQueryBuilder('equipement')
      .where('equipement.designation ILIKE :terme', { terme: `%${terme}%` })
      .orWhere('equipement.reference ILIKE :terme', { terme: `%${terme}%` })
      .orWhere('equipement.marque ILIKE :terme', { terme: `%${terme}%` })
      .orWhere('equipement.modele ILIKE :terme', { terme: `%${terme}%` })
      .orderBy('equipement.designation', 'ASC')
      .getMany();

    return EquipementOrmMapper.toDomainList(ormEntities);
  }

  async countByStatut(statut: StatutEquipement): Promise<number> {
    return this.ormRepository.count({ where: { statut } });
  }

  async countByType(type: TypeEquipement): Promise<number> {
    return this.ormRepository.count({ where: { typeEquipement: type } });
  }

  async getValeurTotaleStock(): Promise<number> {
    const result = await this.ormRepository
      .createQueryBuilder('equipement')
      .select(
        'SUM(equipement.valeur_unitaire * equipement.quantite_stock)',
        'total',
      )
      .getRawOne();

    return result?.total ? Number(result.total) : 0;
  }

  async findNecessitantMaintenance(seuilPannes: number): Promise<Equipement[]> {
    const ormEntities = await this.ormRepository
      .createQueryBuilder('equipement')
      .where('equipement.historique_pannes >= :seuil', { seuil: seuilPannes })
      .orderBy('equipement.historique_pannes', 'DESC')
      .getMany();

    return EquipementOrmMapper.toDomainList(ormEntities);
  }
}
