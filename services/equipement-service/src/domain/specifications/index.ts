export { ISpecification, Specification } from './specification.interface';

export {
  EquipementDisponibleSpecification,
  StockFaibleSpecification,
  EquipementEpuiseSpecification,
  EquipementTypeSpecification,
  EquipementStatutSpecification,
  NecessiteMaintenance,
  EnGarantieSpecification,
  EquipementCategorieSpecification,
  QuantiteDisponibleMinimaleSpecification,
  EquipementConsommableSpecification,
  EquipementImmobiliseSpecification,
} from './equipement.specifications';

export {
  StockCritiqueSpecification,
  ReapprovisionnementNecessaireSpecification,
  StockSuffisantPourAffectationSpecification,
  AvecReservationsSpecification,
  ValeurStockSuperieurSeuilSpecification,
  RotationLenteSpecification,
} from './stock.specifications';
