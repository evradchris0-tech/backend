/**
 * Value Object représentant une adresse
 */
export class Adresse {
  private readonly _rue?: string;
  private readonly _quartier?: string;
  private readonly _ville?: string;
  private readonly _pays: string;

  constructor(
    rue?: string,
    quartier?: string,
    ville?: string,
    pays: string = 'Cameroun',
  ) {
    this.validatePays(pays);

    this._rue = rue?.trim();
    this._quartier = quartier?.trim();
    this._ville = ville?.trim();
    this._pays = pays.trim();
  }

  get rue(): string | undefined {
    return this._rue;
  }

  get quartier(): string | undefined {
    return this._quartier;
  }

  get ville(): string | undefined {
    return this._ville;
  }

  get pays(): string {
    return this._pays;
  }

  /**
   * Retourne une représentation complète de l'adresse
   */
  getAdresseComplete(): string {
    const parts: string[] = [];

    if (this._rue) parts.push(this._rue);
    if (this._quartier) parts.push(this._quartier);
    if (this._ville) parts.push(this._ville);
    parts.push(this._pays);

    return parts.join(', ');
  }

  equals(other: Adresse): boolean {
    return (
      this._rue === other._rue &&
      this._quartier === other._quartier &&
      this._ville === other._ville &&
      this._pays === other._pays
    );
  }

  toString(): string {
    return this.getAdresseComplete();
  }

  toJSON() {
    return {
      rue: this._rue,
      quartier: this._quartier,
      ville: this._ville,
      pays: this._pays,
    };
  }

  static fromJSON(json: {
    rue?: string;
    quartier?: string;
    ville?: string;
    pays?: string;
  }): Adresse {
    return new Adresse(json.rue, json.quartier, json.ville, json.pays);
  }

  private validatePays(pays: string): void {
    if (!pays || pays.trim().length === 0) {
      throw new Error('Le pays ne peut pas être vide');
    }
  }
}
