import { Contact, Adresse } from '../value-objects';

/**
 * Entité Fournisseur - Représente un fournisseur d'équipements
 */
export class Fournisseur {
  private _id: string;
  private _nom: string;
  private _contact: Contact;
  private _adresse?: Adresse;
  private _conditionsPaiement?: string;
  private _estActif: boolean;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(params: {
    id: string;
    nom: string;
    contact: Contact;
    adresse?: Adresse;
    conditionsPaiement?: string;
    estActif?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this._id = params.id;
    this._nom = params.nom;
    this._contact = params.contact;
    this._adresse = params.adresse;
    this._conditionsPaiement = params.conditionsPaiement;
    this._estActif = params.estActif !== undefined ? params.estActif : true;
    this._createdAt = params.createdAt || new Date();
    this._updatedAt = params.updatedAt || new Date();

    this.validate();
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get nom(): string {
    return this._nom;
  }

  get contact(): Contact {
    return this._contact;
  }

  get adresse(): Adresse | undefined {
    return this._adresse;
  }

  get conditionsPaiement(): string | undefined {
    return this._conditionsPaiement;
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
   * Active le fournisseur
   */
  activer(): void {
    this._estActif = true;
    this._updatedAt = new Date();
  }

  /**
   * Désactive le fournisseur
   */
  desactiver(): void {
    this._estActif = false;
    this._updatedAt = new Date();
  }

  /**
   * Met à jour les informations
   */
  mettreAJour(params: {
    nom?: string;
    contact?: Contact;
    adresse?: Adresse;
    conditionsPaiement?: string;
  }): void {
    if (params.nom) this._nom = params.nom;
    if (params.contact) this._contact = params.contact;
    if (params.adresse !== undefined) this._adresse = params.adresse;
    if (params.conditionsPaiement !== undefined)
      this._conditionsPaiement = params.conditionsPaiement;

    this._updatedAt = new Date();
    this.validate();
  }

  /**
   * Validation
   */
  private validate(): void {
    if (!this._nom || this._nom.trim().length === 0) {
      throw new Error('Le nom du fournisseur ne peut pas être vide');
    }
  }
}
