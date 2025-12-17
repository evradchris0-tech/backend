/**
 * Interface de base pour tous les événements de domaine
 */
export interface IDomainEvent {
  /**
   * Nom de l'événement
   */
  eventName: string;

  /**
   * Date/heure de l'événement
   */
  occurredOn: Date;

  /**
   * ID de l'entité concernée
   */
  aggregateId: string;

  /**
   * Données de l'événement
   */
  payload: any;
}

/**
 * Classe abstraite de base pour les événements de domaine
 */
export abstract class DomainEvent implements IDomainEvent {
  public readonly occurredOn: Date;

  constructor(
    public readonly eventName: string,
    public readonly aggregateId: string,
    public readonly payload: any,
  ) {
    this.occurredOn = new Date();
  }
}
