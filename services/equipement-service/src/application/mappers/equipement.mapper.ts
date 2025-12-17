import { Equipement } from '../../domain/entities';
import { Money, EquipementMetadata } from '../../domain/value-objects';
import { StatutEquipement } from '../../domain/enums';
import {
  CreateEquipementDto,
  EquipementResponseDto,
} from '../dto/equipement';

/**
 * Mapper pour convertir entre Domain et DTOs
 */
export class EquipementMapper {
  /**
   * DTO -> Domain Entity
   */
  static toDomain(
    id: string,
    dto: CreateEquipementDto,
  ): Equipement {
    const valeurUnitaire = new Money(
      dto.valeurUnitaire.montant,
      dto.valeurUnitaire.devise || 'FCFA',
    );

    const metadata = dto.metadata
      ? new EquipementMetadata(
          dto.metadata.poids,
          dto.metadata.dimensions,
          dto.metadata.couleur,
          dto.metadata.garantieMois,
        )
      : undefined;

    return new Equipement({
      id,
      designation: dto.designation,
      reference: dto.reference,
      categorieId: dto.categorieId,
      typeEquipement: dto.typeEquipement,
      statut: StatutEquipement.EN_STOCK,
      quantiteStock: dto.quantiteStock,
      quantiteMinimale: dto.quantiteMinimale,
      quantiteReservee: 0,
      unite: dto.unite,
      valeurUnitaire,
      marque: dto.marque,
      modele: dto.modele,
      numeroSerie: dto.numeroSerie,
      qualite: dto.qualite,
      dateAcquisition: dto.dateAcquisition,
      dureeVieEstimee: dto.dureeVieEstimee,
      fournisseurId: dto.fournisseurId,
      espaceStockageId: dto.espaceStockageId,
      observations: dto.observations,
      metadata,
    });
  }

  /**
   * Domain Entity -> Response DTO
   */
  static toDto(equipement: Equipement): EquipementResponseDto {
    return {
      id: equipement.id,
      designation: equipement.designation,
      reference: equipement.reference,
      categorieId: equipement.categorieId,
      typeEquipement: equipement.typeEquipement,
      marque: equipement.marque,
      modele: equipement.modele,
      numeroSerie: equipement.numeroSerie,
      statut: equipement.statut,
      qualite: equipement.qualite,
      quantiteStock: equipement.quantiteStock,
      quantiteMinimale: equipement.quantiteMinimale,
      quantiteReservee: equipement.quantiteReservee,
      quantiteDisponible: equipement.quantiteDisponible,
      unite: equipement.unite,
      valeurUnitaire: {
        montant: equipement.valeurUnitaire.montant,
        devise: equipement.valeurUnitaire.devise,
      },
      valeurTotaleStock: {
        montant: equipement.valeurTotaleStock.montant,
        devise: equipement.valeurTotaleStock.devise,
      },
      dateAcquisition: equipement.dateAcquisition,
      dureeVieEstimee: equipement.dureeVieEstimee,
      fournisseurId: equipement.fournisseurId,
      espaceStockageId: equipement.espaceStockageId,
      observations: equipement.observations,
      metadata: equipement.metadata
        ? {
            poids: equipement.metadata.poids,
            dimensions: equipement.metadata.dimensions,
            couleur: equipement.metadata.couleur,
            garantieMois: equipement.metadata.garantieMois,
          }
        : undefined,
      historiquePannes: equipement.historiquePannes,
      isStockFaible: equipement.isStockFaible(),
      isDisponible: equipement.isDisponible(),
      createdAt: equipement.createdAt,
      updatedAt: equipement.updatedAt,
    };
  }

  /**
   * Array Domain -> Array DTO
   */
  static toDtoList(equipements: Equipement[]): EquipementResponseDto[] {
    return equipements.map((eq) => this.toDto(eq));
  }
}
