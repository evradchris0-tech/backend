/**
 * Value Object représentant les métadonnées d'un équipement
 */
export class EquipementMetadata {
  private readonly _poids?: number;
  private readonly _dimensions?: string;
  private readonly _couleur?: string;
  private readonly _garantieMois?: number;

  constructor(
    poids?: number,
    dimensions?: string,
    couleur?: string,
    garantieMois?: number,
  ) {
    if (poids !== undefined) {
      this.validatePoids(poids);
    }
    if (garantieMois !== undefined) {
      this.validateGarantie(garantieMois);
    }

    this._poids = poids;
    this._dimensions = dimensions?.trim();
    this._couleur = couleur?.trim();
    this._garantieMois = garantieMois;
  }

  get poids(): number | undefined {
    return this._poids;
  }

  get dimensions(): string | undefined {
    return this._dimensions;
  }

  get couleur(): string | undefined {
    return this._couleur;
  }

  get garantieMois(): number | undefined {
    return this._garantieMois;
  }

  /**
   * Vérifie si la garantie est encore valide
   */
  isGarantieValide(dateAcquisition: Date): boolean {
    if (!this._garantieMois || !dateAcquisition) {
      return false;
    }

    const dateExpiration = new Date(dateAcquisition);
    dateExpiration.setMonth(dateExpiration.getMonth() + this._garantieMois);

    return new Date() <= dateExpiration;
  }

  /**
   * Retourne la date d'expiration de la garantie
   */
  getDateExpirationGarantie(dateAcquisition: Date): Date | null {
    if (!this._garantieMois || !dateAcquisition) {
      return null;
    }

    const dateExpiration = new Date(dateAcquisition);
    dateExpiration.setMonth(dateExpiration.getMonth() + this._garantieMois);

    return dateExpiration;
  }

  equals(other: EquipementMetadata): boolean {
    return (
      this._poids === other._poids &&
      this._dimensions === other._dimensions &&
      this._couleur === other._couleur &&
      this._garantieMois === other._garantieMois
    );
  }

  toString(): string {
    const parts: string[] = [];

    if (this._poids) parts.push(`${this._poids}kg`);
    if (this._dimensions) parts.push(this._dimensions);
    if (this._couleur) parts.push(this._couleur);
    if (this._garantieMois) parts.push(`Garantie: ${this._garantieMois} mois`);

    return parts.join(' | ');
  }

  toJSON() {
    return {
      poids: this._poids,
      dimensions: this._dimensions,
      couleur: this._couleur,
      garantieMois: this._garantieMois,
    };
  }

  static fromJSON(json: {
    poids?: number;
    dimensions?: string;
    couleur?: string;
    garantieMois?: number;
  }): EquipementMetadata {
    return new EquipementMetadata(
      json.poids,
      json.dimensions,
      json.couleur,
      json.garantieMois,
    );
  }

  private validatePoids(poids: number): void {
    if (poids <= 0) {
      throw new Error('Le poids doit être supérieur à zéro');
    }
  }

  private validateGarantie(garantieMois: number): void {
    if (garantieMois < 0) {
      throw new Error('La durée de garantie ne peut pas être négative');
    }
    if (garantieMois > 600) {
      // Max 50 ans
      throw new Error('La durée de garantie semble excessive (max 600 mois)');
    }
  }
}
