/**
 * Entité CategorieEquipement - Représente une catégorie d'équipement
 * Supporte une arborescence parent-enfant
 */
export class CategorieEquipement {
  private _id: string;
  private _code: string;
  private _libelle: string;
  private _description?: string;
  private _categorieParentId?: string;
  private _estActif: boolean;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(params: {
    id: string;
    code: string;
    libelle: string;
    description?: string;
    categorieParentId?: string;
    estActif?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this._id = params.id;
    this._code = params.code;
    this._libelle = params.libelle;
    this._description = params.description;
    this._categorieParentId = params.categorieParentId;
    this._estActif = params.estActif !== undefined ? params.estActif : true;
    this._createdAt = params.createdAt || new Date();
    this._updatedAt = params.updatedAt || new Date();

    this.validate();
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get code(): string {
    return this._code;
  }

  get libelle(): string {
    return this._libelle;
  }

  get description(): string | undefined {
    return this._description;
  }

  get categorieParentId(): string | undefined {
    return this._categorieParentId;
  }

  get estActif(): boolean {
    return this._estActif;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  // Business Methods

  /**
   * Vérifie si c'est une catégorie racine (sans parent)
   */
  isRacine(): boolean {
    return !this._categorieParentId;
  }

  /**
   * Vérifie si c'est une sous-catégorie
   */
  isSousCategorie(): boolean {
    return !!this._categorieParentId;
  }

  /**
   * Active la catégorie
   */
  activer(): void {
    this._estActif = true;
    this._updatedAt = new Date();
  }

  /**
   * Désactive la catégorie
   */
  desactiver(): void {
    this._estActif = false;
    this._updatedAt = new Date();
  }

  /**
   * Met à jour les informations
   */
  mettreAJour(params: {
    libelle?: string;
    description?: string;
    categorieParentId?: string;
  }): void {
    if (params.libelle) this._libelle = params.libelle;
    if (params.description !== undefined)
      this._description = params.description;
    if (params.categorieParentId !== undefined) {
      // Empêcher les références circulaires
      if (params.categorieParentId === this._id) {
        throw new Error('Une catégorie ne peut pas être son propre parent');
      }
      this._categorieParentId = params.categorieParentId;
    }

    this._updatedAt = new Date();
    this.validate();
  }

  /**
   * Validation
   */
  private validate(): void {
    if (!this._code || this._code.trim().length === 0) {
      throw new Error('Le code ne peut pas être vide');
    }

    if (!this._libelle || this._libelle.trim().length === 0) {
      throw new Error('Le libellé ne peut pas être vide');
    }

    if (this._categorieParentId === this._id) {
      throw new Error('Une catégorie ne peut pas être son propre parent');
    }
  }
}
