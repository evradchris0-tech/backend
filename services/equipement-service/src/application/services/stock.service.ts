import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  IEquipementRepository,
  StockReapprovisionneEvent,
  StockFaibleEvent,
  StockEpuiseEvent,
} from '../../domain';
import { AjusterStockDto, EquipementResponseDto } from '../dto/equipement';
import { EquipementMapper } from '../mappers';

@Injectable()
export class StockService {
  constructor(
    @Inject('IEquipementRepository')
    private readonly equipementRepository: IEquipementRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async ajouterStock(
    equipementId: string,
    dto: AjusterStockDto,
  ): Promise<EquipementResponseDto> {
    if (dto.quantite <= 0) {
      throw new BadRequestException(
        'La quantité à ajouter doit être positive',
      );
    }

    const equipement = await this.equipementRepository.findById(equipementId);
    if (!equipement) {
      throw new NotFoundException(
        `Équipement avec ID ${equipementId} non trouvé`,
      );
    }

    const quantiteAvant = equipement.quantiteStock;
    equipement.ajouterStock(dto.quantite);
    const updated = await this.equipementRepository.save(equipement);

    this.eventEmitter.emit(
      'equipement.stock.reapprovisionne',
      new StockReapprovisionneEvent(updated.id, {
        designation: updated.designation,
        reference: updated.reference,
        quantiteAvant,
        quantiteApres: updated.quantiteStock,
        quantiteAjoutee: dto.quantite,
      }),
    );

    return EquipementMapper.toDto(updated);
  }

  async retirerStock(
    equipementId: string,
    dto: AjusterStockDto,
  ): Promise<EquipementResponseDto> {
    if (dto.quantite <= 0) {
      throw new BadRequestException(
        'La quantité à retirer doit être positive',
      );
    }

    const equipement = await this.equipementRepository.findById(equipementId);
    if (!equipement) {
      throw new NotFoundException(
        `Équipement avec ID ${equipementId} non trouvé`,
      );
    }

    equipement.retirerStock(dto.quantite);
    const updated = await this.equipementRepository.save(equipement);

    // Vérifier alertes stock
    this.checkStockAlerts(updated);

    return EquipementMapper.toDto(updated);
  }

  async reserverStock(
    equipementId: string,
    quantite: number,
  ): Promise<EquipementResponseDto> {
    const equipement = await this.equipementRepository.findById(equipementId);
    if (!equipement) {
      throw new NotFoundException(
        `Équipement avec ID ${equipementId} non trouvé`,
      );
    }

    equipement.reserverQuantite(quantite);
    const updated = await this.equipementRepository.save(equipement);

    return EquipementMapper.toDto(updated);
  }

  async libererReservation(
    equipementId: string,
    quantite: number,
  ): Promise<EquipementResponseDto> {
    const equipement = await this.equipementRepository.findById(equipementId);
    if (!equipement) {
      throw new NotFoundException(
        `Équipement avec ID ${equipementId} non trouvé`,
      );
    }

    equipement.libererReservation(quantite);
    const updated = await this.equipementRepository.save(equipement);

    return EquipementMapper.toDto(updated);
  }

  private checkStockAlerts(equipement: any): void {
    if (equipement.quantiteStock === 0) {
      this.eventEmitter.emit(
        'equipement.stock.epuise',
        new StockEpuiseEvent(equipement.id, {
          designation: equipement.designation,
          reference: equipement.reference,
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
