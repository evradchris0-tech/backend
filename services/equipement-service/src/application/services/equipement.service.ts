import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { v4 as uuidv4 } from 'uuid';
import {
  IEquipementRepository,
  Equipement,
  EquipementCreeEvent,
  EquipementMisAJourEvent,
  EquipementHorsServiceEvent,
  EquipementObsoleteEvent,
  StockFaibleEvent,
  StockCritiqueEvent,
  StockEpuiseEvent,
  PanneEnregistreeEvent,
  MaintenanceTermineeEvent,
} from '../../domain';
import {
  CreateEquipementDto,
  UpdateEquipementDto,
  EquipementResponseDto,
} from '../dto/equipement';
import { EquipementMapper } from '../mappers';

@Injectable()
export class EquipementService {
  constructor(
    @Inject('IEquipementRepository')
    private readonly equipementRepository: IEquipementRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreateEquipementDto): Promise<EquipementResponseDto> {
    const id = uuidv4();
    const equipement = EquipementMapper.toDomain(id, dto);

    const saved = await this.equipementRepository.save(equipement);

    // Émettre événement de création
    this.eventEmitter.emit(
      'equipement.cree',
      new EquipementCreeEvent(saved.id, {
        designation: saved.designation,
        reference: saved.reference,
        typeEquipement: saved.typeEquipement,
        categorieId: saved.categorieId,
        quantiteStock: saved.quantiteStock,
        valeurUnitaire: saved.valeurUnitaire.montant,
      }),
    );

    // Vérifier stock faible dès la création
    this.checkStockAlerts(saved);

    return EquipementMapper.toDto(saved);
  }

  async findById(id: string): Promise<EquipementResponseDto> {
    const equipement = await this.equipementRepository.findById(id);
    if (!equipement) {
      throw new NotFoundException(`Équipement avec ID ${id} non trouvé`);
    }
    return EquipementMapper.toDto(equipement);
  }

  async findAll(): Promise<EquipementResponseDto[]> {
    const equipements = await this.equipementRepository.findAll();
    return EquipementMapper.toDtoList(equipements);
  }

  async findByReference(reference: string): Promise<EquipementResponseDto> {
    const equipement =
      await this.equipementRepository.findByReference(reference);
    if (!equipement) {
      throw new NotFoundException(
        `Équipement avec référence ${reference} non trouvé`,
      );
    }
    return EquipementMapper.toDto(equipement);
  }

  async findByCategorie(categorieId: string): Promise<EquipementResponseDto[]> {
    const equipements =
      await this.equipementRepository.findByCategorie(categorieId);
    return EquipementMapper.toDtoList(equipements);
  }

  async findStockFaible(): Promise<EquipementResponseDto[]> {
    const equipements = await this.equipementRepository.findStockFaible();
    return EquipementMapper.toDtoList(equipements);
  }

  async findDisponibles(): Promise<EquipementResponseDto[]> {
    const equipements = await this.equipementRepository.findDisponibles();
    return EquipementMapper.toDtoList(equipements);
  }

  async search(terme: string): Promise<EquipementResponseDto[]> {
    const equipements = await this.equipementRepository.search(terme);
    return EquipementMapper.toDtoList(equipements);
  }

  async update(
    id: string,
    dto: UpdateEquipementDto,
  ): Promise<EquipementResponseDto> {
    const equipement = await this.equipementRepository.findById(id);
    if (!equipement) {
      throw new NotFoundException(`Équipement avec ID ${id} non trouvé`);
    }

    equipement.mettreAJour({
      designation: dto.designation,
      marque: dto.marque,
      modele: dto.modele,
      qualite: dto.qualite,
      quantiteMinimale: dto.quantiteMinimale,
      observations: dto.observations,
    });

    const updated = await this.equipementRepository.save(equipement);

    this.eventEmitter.emit(
      'equipement.mis_a_jour',
      new EquipementMisAJourEvent(updated.id, {
        designation: updated.designation,
        reference: updated.reference,
        champsModifies: Object.keys(dto),
      }),
    );

    return EquipementMapper.toDto(updated);
  }

  async marquerHorsService(
    id: string,
    motif?: string,
  ): Promise<EquipementResponseDto> {
    const equipement = await this.equipementRepository.findById(id);
    if (!equipement) {
      throw new NotFoundException(`Équipement avec ID ${id} non trouvé`);
    }

    equipement.marquerHorsService(motif);
    const updated = await this.equipementRepository.save(equipement);

    this.eventEmitter.emit(
      'equipement.hors_service',
      new EquipementHorsServiceEvent(updated.id, {
        designation: updated.designation,
        reference: updated.reference,
        motif,
      }),
    );

    return EquipementMapper.toDto(updated);
  }

  async marquerObsolete(
    id: string,
    motif?: string,
  ): Promise<EquipementResponseDto> {
    const equipement = await this.equipementRepository.findById(id);
    if (!equipement) {
      throw new NotFoundException(`Équipement avec ID ${id} non trouvé`);
    }

    equipement.marquerObsolete(motif);
    const updated = await this.equipementRepository.save(equipement);

    this.eventEmitter.emit(
      'equipement.obsolete',
      new EquipementObsoleteEvent(updated.id, {
        designation: updated.designation,
        reference: updated.reference,
        motif,
      }),
    );

    return EquipementMapper.toDto(updated);
  }

  async enregistrerPanne(id: string): Promise<EquipementResponseDto> {
    const equipement = await this.equipementRepository.findById(id);
    if (!equipement) {
      throw new NotFoundException(`Équipement avec ID ${id} non trouvé`);
    }

    equipement.enregistrerPanne();
    const updated = await this.equipementRepository.save(equipement);

    this.eventEmitter.emit(
      'equipement.panne',
      new PanneEnregistreeEvent(updated.id, {
        designation: updated.designation,
        reference: updated.reference,
        historiquePannes: updated.historiquePannes,
      }),
    );

    return EquipementMapper.toDto(updated);
  }

  async finirMaintenance(id: string): Promise<EquipementResponseDto> {
    const equipement = await this.equipementRepository.findById(id);
    if (!equipement) {
      throw new NotFoundException(`Équipement avec ID ${id} non trouvé`);
    }

    equipement.finirMaintenance();
    const updated = await this.equipementRepository.save(equipement);

    this.eventEmitter.emit(
      'equipement.maintenance_terminee',
      new MaintenanceTermineeEvent(updated.id, {
        designation: updated.designation,
        reference: updated.reference,
      }),
    );

    return EquipementMapper.toDto(updated);
  }

  async delete(id: string): Promise<void> {
    const equipement = await this.equipementRepository.findById(id);
    if (!equipement) {
      throw new NotFoundException(`Équipement avec ID ${id} non trouvé`);
    }

    await this.equipementRepository.delete(id);
  }

  /**
   * Vérifie et émet des alertes de stock
   */
  private checkStockAlerts(equipement: Equipement): void {
    if (equipement.quantiteStock === 0) {
      this.eventEmitter.emit(
        'equipement.stock.epuise',
        new StockEpuiseEvent(equipement.id, {
          designation: equipement.designation,
          reference: equipement.reference,
          categorieId: equipement.categorieId,
        }),
      );
    } else if (
      equipement.quantiteStock <
      equipement.quantiteMinimale / 2
    ) {
      this.eventEmitter.emit(
        'equipement.stock.critique',
        new StockCritiqueEvent(equipement.id, {
          designation: equipement.designation,
          reference: equipement.reference,
          quantiteActuelle: equipement.quantiteStock,
          categorieId: equipement.categorieId,
        }),
      );
    } else if (equipement.isStockFaible()) {
      this.eventEmitter.emit(
        'equipement.stock.faible',
        new StockFaibleEvent(equipement.id, {
          designation: equipement.designation,
          reference: equipement.reference,
          quantiteActuelle: equipement.quantiteStock,
          quantiteMinimale: equipement.quantiteMinimale,
          categorieId: equipement.categorieId,
        }),
      );
    }
  }
}
