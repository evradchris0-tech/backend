import { Money } from './money.vo';

/**
 * Value Object représentant une facture
 */
export class Facture {
  private readonly _numero: string;
  private readonly _montant: Money;
  private readonly _dateFacture: Date;
  private readonly _fichierUrl?: string;

  constructor(
    numero: string,
    montant: Money,
    dateFacture: Date,
    fichierUrl?: string,
  ) {
    this.validateNumero(numero);
    this.validateDate(dateFacture);

    this._numero = numero.trim();
    this._montant = montant;
    this._dateFacture = dateFacture;
    this._fichierUrl = fichierUrl?.trim();
  }

  get numero(): string {
    return this._numero;
  }

  get montant(): Money {
    return this._montant;
  }

  get dateFacture(): Date {
    return this._dateFacture;
  }

  get fichierUrl(): string | undefined {
    return this._fichierUrl;
  }

  equals(other: Facture): boolean {
    return (
      this._numero === other._numero &&
      this._montant.equals(other._montant) &&
      this._dateFacture.getTime() === other._dateFacture.getTime() &&
      this._fichierUrl === other._fichierUrl
    );
  }

  toString(): string {
    return `Facture N° ${this._numero} - ${this._montant.toString()} - ${this._dateFacture.toLocaleDateString()}`;
  }

  toJSON() {
    return {
      numero: this._numero,
      montant: this._montant.toJSON(),
      dateFacture: this._dateFacture.toISOString(),
      fichierUrl: this._fichierUrl,
    };
  }

  static fromJSON(json: {
    numero: string;
    montant: { montant: number; devise: string };
    dateFacture: string;
    fichierUrl?: string;
  }): Facture {
    return new Facture(
      json.numero,
      Money.fromJSON(json.montant),
      new Date(json.dateFacture),
      json.fichierUrl,
    );
  }

  private validateNumero(numero: string): void {
    if (!numero || numero.trim().length === 0) {
      throw new Error('Le numéro de facture ne peut pas être vide');
    }
  }

  private validateDate(date: Date): void {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      throw new Error('La date de facture est invalide');
    }
    if (date > new Date()) {
      throw new Error('La date de facture ne peut pas être dans le futur');
    }
  }
}
