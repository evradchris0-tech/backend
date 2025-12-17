export { IDomainEvent, DomainEvent } from './domain-event.interface';

export {
  StockFaibleEvent,
  StockCritiqueEvent,
  StockEpuiseEvent,
  StockReapprovisionneEvent,
} from './stock-alerte.event';

export {
  EquipementAffecteEvent,
  EquipementRetourneEvent,
  AffectationEnRetardEvent,
  EquipementPerduEvent,
  EquipementEndommageEvent,
} from './equipement-affecte.event';

export {
  MouvementCreeEvent,
  EntreeStockEvent,
  SortieStockEvent,
  TransfertStockEvent,
} from './mouvement-cree.event';

export {
  EquipementCreeEvent,
  EquipementMisAJourEvent,
  EquipementHorsServiceEvent,
  EquipementObsoleteEvent,
} from './equipement-cree.event';

export {
  PanneEnregistreeEvent,
  MaintenanceTermineeEvent,
  MaintenanceNecessaireEvent,
} from './maintenance.event';
