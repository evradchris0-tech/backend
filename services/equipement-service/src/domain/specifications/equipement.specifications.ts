import { Equipement } from '../entities';
import { StatutEquipement, TypeEquipement } from '../enums';
import { Specification } from './specification.interface';

/**
 * Spécification: Équipement disponible
 */
export class EquipementDisponibleSpecification extends Specification<Equipement> {
  isSatisfiedBy(equipement: Equipement): boolean {
    return equipement.isDisponible();
  }
}

/**
 * Spécification: Stock faible
 */
export class StockFaibleSpecification extends Specification<Equipement> {
  isSatisfiedBy(equipement: Equipement): boolean {
    return equipement.isStockFaible();
  }
}

/**
 * Spécification: Équipement épuisé
 */
export class EquipementEpuiseSpecification extends Specification<Equipement> {
  isSatisfiedBy(equipement: Equipement): boolean {
    return equipement.statut === StatutEquipement.EPUISE;
  }
}

/**
 * Spécification: Équipement d'un type spécifique
 */
export class EquipementTypeSpecification extends Specification<Equipement> {
  constructor(private type: TypeEquipement) {
    super();
  }

  isSatisfiedBy(equipement: Equipement): boolean {
    return equipement.typeEquipement === this.type;
  }
}

/**
 * Spécification: Équipement avec statut spécifique
 */
export class EquipementStatutSpecification extends Specification<Equipement> {
  constructor(private statut: StatutEquipement) {
    super();
  }

  isSatisfiedBy(equipement: Equipement): boolean {
    return equipement.statut === this.statut;
  }
}

/**
 * Spécification: Équipement nécessitant maintenance
 */
export class NecessiteMaintenance extends Specification<Equipement> {
  constructor(private seuilPannes: number = 3) {
    super();
  }

  isSatisfiedBy(equipement: Equipement): boolean {
    return equipement.historiquePannes >= this.seuilPannes;
  }
}

/**
 * Spécification: Équipement en garantie
 */
export class EnGarantieSpecification extends Specification<Equipement> {
  isSatisfiedBy(equipement: Equipement): boolean {
    if (!equipement.metadata || !equipement.dateAcquisition) {
      return false;
    }
    return equipement.metadata.isGarantieValide(equipement.dateAcquisition);
  }
}

/**
 * Spécification: Équipement de catégorie spécifique
 */
export class EquipementCategorieSpecification extends Specification<Equipement> {
  constructor(private categorieId: string) {
    super();
  }

  isSatisfiedBy(equipement: Equipement): boolean {
    return equipement.categorieId === this.categorieId;
  }
}

/**
 * Spécification: Équipement avec quantité disponible minimale
 */
export class QuantiteDisponibleMinimaleSpecification extends Specification<Equipement> {
  constructor(private quantiteMinimale: number) {
    super();
  }

  isSatisfiedBy(equipement: Equipement): boolean {
    return equipement.quantiteDisponible >= this.quantiteMinimale;
  }
}

/**
 * Spécification: Équipement consommable
 */
export class EquipementConsommableSpecification extends Specification<Equipement> {
  isSatisfiedBy(equipement: Equipement): boolean {
    return (
      equipement.typeEquipement === TypeEquipement.CONSOMMABLE ||
      equipement.typeEquipement === TypeEquipement.FOURNITURE_BUREAU
    );
  }
}

/**
 * Spécification: Équipement immobilisé (valeur élevée)
 */
export class EquipementImmobiliseSpecification extends Specification<Equipement> {
  constructor(private seuilValeur: number = 100000) {
    super();
  }

  isSatisfiedBy(equipement: Equipement): boolean {
    return equipement.valeurUnitaire.montant >= this.seuilValeur;
  }
}
