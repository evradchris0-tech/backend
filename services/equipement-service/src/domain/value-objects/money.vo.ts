/**
 * Value Object représentant une valeur monétaire
 * Immutable et respectant les principes DDD
 */
export class Money {
  private readonly _montant: number;
  private readonly _devise: string;

  constructor(montant: number, devise: string = 'FCFA') {
    this.validateMontant(montant);
    this.validateDevise(devise);

    this._montant = montant;
    this._devise = devise;
  }

  get montant(): number {
    return this._montant;
  }

  get devise(): string {
    return this._devise;
  }

  /**
   * Additionne deux montants de même devise
   */
  add(other: Money): Money {
    this.validateSameDevise(other);
    return new Money(this._montant + other._montant, this._devise);
  }

  /**
   * Soustrait un montant d'un autre (même devise)
   */
  subtract(other: Money): Money {
    this.validateSameDevise(other);
    return new Money(this._montant - other._montant, this._devise);
  }

  /**
   * Multiplie le montant par un facteur
   */
  multiply(factor: number): Money {
    if (factor < 0) {
      throw new Error('Le facteur de multiplication ne peut pas être négatif');
    }
    return new Money(this._montant * factor, this._devise);
  }

  /**
   * Vérifie l'égalité avec un autre Money
   */
  equals(other: Money): boolean {
    return (
      this._montant === other._montant && this._devise === other._devise
    );
  }

  /**
   * Représentation en chaîne de caractères
   */
  toString(): string {
    return `${this._montant.toFixed(2)} ${this._devise}`;
  }

  /**
   * Conversion en objet simple pour la persistence
   */
  toJSON() {
    return {
      montant: this._montant,
      devise: this._devise,
    };
  }

  /**
   * Création depuis un objet simple
   */
  static fromJSON(json: { montant: number; devise: string }): Money {
    return new Money(json.montant, json.devise);
  }

  private validateMontant(montant: number): void {
    if (montant < 0) {
      throw new Error('Le montant ne peut pas être négatif');
    }
    if (!Number.isFinite(montant)) {
      throw new Error('Le montant doit être un nombre valide');
    }
  }

  private validateDevise(devise: string): void {
    if (!devise || devise.trim().length === 0) {
      throw new Error('La devise ne peut pas être vide');
    }
  }

  private validateSameDevise(other: Money): void {
    if (this._devise !== other._devise) {
      throw new Error(
        `Impossible d'opérer sur des devises différentes: ${this._devise} vs ${other._devise}`,
      );
    }
  }
}
