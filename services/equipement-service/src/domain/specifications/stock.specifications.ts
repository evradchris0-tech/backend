import { Equipement } from '../entities';
import { Specification } from './specification.interface';

/**
 * Spécification: Stock critique (0 ou très faible)
 */
export class StockCritiqueSpecification extends Specification<Equipement> {
  isSatisfiedBy(equipement: Equipement): boolean {
    return (
      equipement.quantiteStock === 0 ||
      equipement.quantiteStock < equipement.quantiteMinimale / 2
    );
  }
}

/**
 * Spécification: Réapprovisionnement nécessaire
 */
export class ReapprovisionnementNecessaireSpecification extends Specification<Equipement> {
  isSatisfiedBy(equipement: Equipement): boolean {
    return (
      equipement.isStockFaible() &&
      equipement.quantiteDisponible < equipement.quantiteMinimale
    );
  }
}

/**
 * Spécification: Stock suffisant pour affectation
 */
export class StockSuffisantPourAffectationSpecification extends Specification<Equipement> {
  constructor(private quantiteDemandee: number) {
    super();
  }

  isSatisfiedBy(equipement: Equipement): boolean {
    return equipement.quantiteDisponible >= this.quantiteDemandee;
  }
}

/**
 * Spécification: Équipement avec réservations actives
 */
export class AvecReservationsSpecification extends Specification<Equipement> {
  isSatisfiedBy(equipement: Equipement): boolean {
    return equipement.quantiteReservee > 0;
  }
}

/**
 * Spécification: Valeur stock totale supérieure à seuil
 */
export class ValeurStockSuperieurSeuilSpecification extends Specification<Equipement> {
  constructor(private seuil: number) {
    super();
  }

  isSatisfiedBy(equipement: Equipement): boolean {
    return equipement.valeurTotaleStock.montant >= this.seuil;
  }
}

/**
 * Spécification: Rotation stock lente (pour analyse - nécessite données historiques)
 */
export class RotationLenteSpecification extends Specification<Equipement> {
  constructor(private joursImmobilisation: number = 180) {
    super();
  }

  isSatisfiedBy(equipement: Equipement): boolean {
    // Cette spécification nécessiterait l'accès aux mouvements
    // Pour l'instant, on se base sur le stock élevé et ancienneté
    if (!equipement.dateAcquisition) return false;

    const jourDepuisAcquisition =
      (new Date().getTime() - equipement.dateAcquisition.getTime()) /
      (1000 * 60 * 60 * 24);

    return (
      jourDepuisAcquisition > this.joursImmobilisation &&
      equipement.quantiteStock > equipement.quantiteMinimale * 2
    );
  }
}
