import { Equipement } from '../../../domain/entities';
import { Money, EquipementMetadata } from '../../../domain/value-objects';
import {
  TypeEquipement,
  StatutEquipement,
  UniteEquipement,
} from '../../../domain/enums';
import { EquipementOrmEntity } from '../entities';

/**
 * Mapper ORM ↔ Domain pour Equipement
 */
export class EquipementOrmMapper {
  /**
   * ORM Entity -> Domain Entity
   */
  static toDomain(ormEntity: EquipementOrmEntity): Equipement {
    const valeurUnitaire = new Money(
      Number(ormEntity.valeurUnitaire),
      ormEntity.devise,
    );

    const metadata =
      ormEntity.metadataPoids ||
      ormEntity.metadataDimensions ||
      ormEntity.metadataCouleur ||
      ormEntity.metadataGarantieMois
        ? new EquipementMetadata(
            ormEntity.metadataPoids
              ? Number(ormEntity.metadataPoids)
              : undefined,
            ormEntity.metadataDimensions,
            ormEntity.metadataCouleur,
            ormEntity.metadataGarantieMois,
          )
        : undefined;

    return new Equipement({
      id: ormEntity.id,
      designation: ormEntity.designation,
      reference: ormEntity.reference,
      categorieId: ormEntity.categorieId,
      typeEquipement: ormEntity.typeEquipement as TypeEquipement,
      statut: ormEntity.statut as StatutEquipement,
      quantiteStock: ormEntity.quantiteStock,
      quantiteMinimale: ormEntity.quantiteMinimale,
      quantiteReservee: ormEntity.quantiteReservee,
      unite: ormEntity.unite as UniteEquipement,
      valeurUnitaire,
      marque: ormEntity.marque,
      modele: ormEntity.modele,
      numeroSerie: ormEntity.numeroSerie,
      qualite: ormEntity.qualite,
      dateAcquisition: ormEntity.dateAcquisition,
      dureeVieEstimee: ormEntity.dureeVieEstimee,
      fournisseurId: ormEntity.fournisseurId,
      espaceStockageId: ormEntity.espaceStockageId,
      observations: ormEntity.observations,
      metadata,
      historiquePannes: ormEntity.historiquePannes,
      createdAt: ormEntity.createdAt,
      updatedAt: ormEntity.updatedAt,
    });
  }

  /**
   * Domain Entity -> ORM Entity
   */
  static toOrm(domain: Equipement): EquipementOrmEntity {
    const ormEntity = new EquipementOrmEntity();

    ormEntity.id = domain.id;
    ormEntity.designation = domain.designation;
    ormEntity.reference = domain.reference;
    ormEntity.categorieId = domain.categorieId;
    ormEntity.typeEquipement = domain.typeEquipement;
    ormEntity.statut = domain.statut;
    ormEntity.quantiteStock = domain.quantiteStock;
    ormEntity.quantiteMinimale = domain.quantiteMinimale;
    ormEntity.quantiteReservee = domain.quantiteReservee;
    ormEntity.unite = domain.unite;
    ormEntity.valeurUnitaire = domain.valeurUnitaire.montant;
    ormEntity.devise = domain.valeurUnitaire.devise;
    ormEntity.marque = domain.marque;
    ormEntity.modele = domain.modele;
    ormEntity.numeroSerie = domain.numeroSerie;
    ormEntity.qualite = domain.qualite;
    ormEntity.dateAcquisition = domain.dateAcquisition;
    ormEntity.dureeVieEstimee = domain.dureeVieEstimee;
    ormEntity.fournisseurId = domain.fournisseurId;
    ormEntity.espaceStockageId = domain.espaceStockageId;
    ormEntity.observations = domain.observations;
    ormEntity.historiquePannes = domain.historiquePannes;

    if (domain.metadata) {
      ormEntity.metadataPoids = domain.metadata.poids;
      ormEntity.metadataDimensions = domain.metadata.dimensions;
      ormEntity.metadataCouleur = domain.metadata.couleur;
      ormEntity.metadataGarantieMois = domain.metadata.garantieMois;
    }

    ormEntity.createdAt = domain.createdAt;
    ormEntity.updatedAt = domain.updatedAt;

    return ormEntity;
  }

  /**
   * Array ORM -> Array Domain
   */
  static toDomainList(ormEntities: EquipementOrmEntity[]): Equipement[] {
    return ormEntities.map((e) => this.toDomain(e));
  }
}
