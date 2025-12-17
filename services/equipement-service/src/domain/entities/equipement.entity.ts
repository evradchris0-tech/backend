import {
  TypeEquipement,
  StatutEquipement,
  UniteEquipement,
} from '../enums';
import { Money, EquipementMetadata } from '../value-objects';

/**
 * Entité Equipement - Représente un équipement dans le système
 * Basé sur le cahier des charges et les documents de stock matériel
 */
export class Equipement {
  private _id: string;
  private _designation: string;
  private _reference: string;
  private _categorieId: string;
  private _typeEquipement: TypeEquipement;
  private _marque?: string;
  private _modele?: string;
  private _numeroSerie?: string;
  private _statut: StatutEquipement;
  private _qualite?: string;
  private _quantiteStock: number;
  private _quantiteMinimale: number;
  private _quantiteReservee: number;
  private _unite: UniteEquipement;
  private _valeurUnitaire: Money;
  private _dateAcquisition?: Date;
  private _dureeVieEstimee?: number; // en mois
  private _fournisseurId?: string;
  private _espaceStockageId?: string;
  private _observations?: string;
  private _metadata?: EquipementMetadata;
  private _historiquePannes: number;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(params: {
    id: string;
    designation: string;
    reference: string;
    categorieId: string;
    typeEquipement: TypeEquipement;
    statut: StatutEquipement;
    quantiteStock: number;
    quantiteMinimale: number;
    quantiteReservee?: number;
    unite: UniteEquipement;
    valeurUnitaire: Money;
    marque?: string;
    modele?: string;
    numeroSerie?: string;
    qualite?: string;
    dateAcquisition?: Date;
    dureeVieEstimee?: number;
    fournisseurId?: string;
    espaceStockageId?: string;
    observations?: string;
    metadata?: EquipementMetadata;
    historiquePannes?: number;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this._id = params.id;
    this._designation = params.designation;
    this._reference = params.reference;
    this._categorieId = params.categorieId;
    this._typeEquipement = params.typeEquipement;
    this._statut = params.statut;
    this._quantiteStock = params.quantiteStock;
    this._quantiteMinimale = params.quantiteMinimale;
    this._quantiteReservee = params.quantiteReservee || 0;
    this._unite = params.unite;
    this._valeurUnitaire = params.valeurUnitaire;
    this._marque = params.marque;
    this._modele = params.modele;
    this._numeroSerie = params.numeroSerie;
    this._qualite = params.qualite;
    this._dateAcquisition = params.dateAcquisition;
    this._dureeVieEstimee = params.dureeVieEstimee;
    this._fournisseurId = params.fournisseurId;
    this._espaceStockageId = params.espaceStockageId;
    this._observations = params.observations;
    this._metadata = params.metadata;
    this._historiquePannes = params.historiquePannes || 0;
    this._createdAt = params.createdAt || new Date();
    this._updatedAt = params.updatedAt || new Date();

    this.validate();
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get designation(): string {
    return this._designation;
  }

  get reference(): string {
    return this._reference;
  }

  get categorieId(): string {
    return this._categorieId;
  }

  get typeEquipement(): TypeEquipement {
    return this._typeEquipement;
  }

  get marque(): string | undefined {
    return this._marque;
  }

  get modele(): string | undefined {
    return this._modele;
  }

  get numeroSerie(): string | undefined {
    return this._numeroSerie;
  }

  get statut(): StatutEquipement {
    return this._statut;
  }

  get qualite(): string | undefined {
    return this._qualite;
  }

  get quantiteStock(): number {
    return this._quantiteStock;
  }

  get quantiteMinimale(): number {
    return this._quantiteMinimale;
  }

  get quantiteReservee(): number {
    return this._quantiteReservee;
  }

  get unite(): UniteEquipement {
    return this._unite;
  }

  get valeurUnitaire(): Money {
    return this._valeurUnitaire;
  }

  get dateAcquisition(): Date | undefined {
    return this._dateAcquisition;
  }

  get dureeVieEstimee(): number | undefined {
    return this._dureeVieEstimee;
  }

  get fournisseurId(): string | undefined {
    return this._fournisseurId;
  }

  get espaceStockageId(): string | undefined {
    return this._espaceStockageId;
  }

  get observations(): string | undefined {
    return this._observations;
  }

  get metadata(): EquipementMetadata | undefined {
    return this._metadata;
  }

  get historiquePannes(): number {
    return this._historiquePannes;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  /**
   * Quantité réellement disponible (stock - réservé)
   */
  get quantiteDisponible(): number {
    return Math.max(0, this._quantiteStock - this._quantiteReservee);
  }

  /**
   * Valeur totale du stock
   */
  get valeurTotaleStock(): Money {
    return this._valeurUnitaire.multiply(this._quantiteStock);
  }

  // Business Methods

  /**
   * Ajoute une quantité au stock
   */
  ajouterStock(quantite: number): void {
    if (quantite <= 0) {
      throw new Error('La quantité à ajouter doit être positive');
    }

    this._quantiteStock += quantite;
    this._updatedAt = new Date();

    if (this._statut === StatutEquipement.EPUISE) {
      this._statut = StatutEquipement.EN_STOCK;
    }
  }

  /**
   * Retire une quantité du stock
   */
  retirerStock(quantite: number): void {
    if (quantite <= 0) {
      throw new Error('La quantité à retirer doit être positive');
    }

    if (quantite > this.quantiteDisponible) {
      throw new Error(
        `Stock insuffisant. Disponible: ${this.quantiteDisponible}, Demandé: ${quantite}`,
      );
    }

    this._quantiteStock -= quantite;
    this._updatedAt = new Date();

    if (this._quantiteStock === 0) {
      this._statut = StatutEquipement.EPUISE;
    }
  }

  /**
   * Réserve une quantité
   */
  reserverQuantite(quantite: number): void {
    if (quantite <= 0) {
      throw new Error('La quantité à réserver doit être positive');
    }

    if (quantite > this.quantiteDisponible) {
      throw new Error(
        `Quantité disponible insuffisante pour réservation. Disponible: ${this.quantiteDisponible}`,
      );
    }

    this._quantiteReservee += quantite;
    this._updatedAt = new Date();
  }

  /**
   * Libère une réservation
   */
  libererReservation(quantite: number): void {
    if (quantite <= 0) {
      throw new Error('La quantité à libérer doit être positive');
    }

    if (quantite > this._quantiteReservee) {
      throw new Error(
        `Impossible de libérer ${quantite} unités. Seulement ${this._quantiteReservee} réservées`,
      );
    }

    this._quantiteReservee -= quantite;
    this._updatedAt = new Date();
  }

  /**
   * Vérifie si le stock est en dessous du seuil minimal
   */
  isStockFaible(): boolean {
    return this._quantiteStock <= this._quantiteMinimale;
  }

  /**
   * Vérifie si l'équipement est disponible
   */
  isDisponible(): boolean {
    return (
      this.quantiteDisponible > 0 &&
      this._statut !== StatutEquipement.HORS_SERVICE &&
      this._statut !== StatutEquipement.OBSOLETE
    );
  }

  /**
   * Marque l'équipement comme hors service
   */
  marquerHorsService(motif?: string): void {
    this._statut = StatutEquipement.HORS_SERVICE;
    if (motif) {
      this._observations = `${this._observations || ''}\nHors service: ${motif}`.trim();
    }
    this._updatedAt = new Date();
  }

  /**
   * Marque l'équipement comme obsolète
   */
  marquerObsolete(motif?: string): void {
    this._statut = StatutEquipement.OBSOLETE;
    if (motif) {
      this._observations = `${this._observations || ''}\nObsolète: ${motif}`.trim();
    }
    this._updatedAt = new Date();
  }

  /**
   * Enregistre une panne
   */
  enregistrerPanne(): void {
    this._historiquePannes += 1;
    this._statut = StatutEquipement.EN_MAINTENANCE;
    this._updatedAt = new Date();
  }

  /**
   * Marque la fin de maintenance
   */
  finirMaintenance(): void {
    if (this._statut === StatutEquipement.EN_MAINTENANCE) {
      this._statut = StatutEquipement.EN_STOCK;
      this._updatedAt = new Date();
    }
  }

  /**
   * Met à jour les informations de base
   */
  mettreAJour(params: {
    designation?: string;
    marque?: string;
    modele?: string;
    qualite?: string;
    quantiteMinimale?: number;
    valeurUnitaire?: Money;
    observations?: string;
    metadata?: EquipementMetadata;
  }): void {
    if (params.designation) this._designation = params.designation;
    if (params.marque !== undefined) this._marque = params.marque;
    if (params.modele !== undefined) this._modele = params.modele;
    if (params.qualite !== undefined) this._qualite = params.qualite;
    if (params.quantiteMinimale !== undefined)
      this._quantiteMinimale = params.quantiteMinimale;
    if (params.valeurUnitaire) this._valeurUnitaire = params.valeurUnitaire;
    if (params.observations !== undefined)
      this._observations = params.observations;
    if (params.metadata !== undefined) this._metadata = params.metadata;

    this._updatedAt = new Date();
    this.validate();
  }

  /**
   * Validation des règles métier
   */
  private validate(): void {
    if (!this._designation || this._designation.trim().length === 0) {
      throw new Error('La désignation ne peut pas être vide');
    }

    if (!this._reference || this._reference.trim().length === 0) {
      throw new Error('La référence ne peut pas être vide');
    }

    if (this._quantiteStock < 0) {
      throw new Error('La quantité en stock ne peut pas être négative');
    }

    if (this._quantiteMinimale < 0) {
      throw new Error('La quantité minimale ne peut pas être négative');
    }

    if (this._quantiteReservee < 0) {
      throw new Error('La quantité réservée ne peut pas être négative');
    }

    if (this._quantiteReservee > this._quantiteStock) {
      throw new Error(
        'La quantité réservée ne peut pas dépasser le stock disponible',
      );
    }

    if (this._historiquePannes < 0) {
      throw new Error("L'historique des pannes ne peut pas être négatif");
    }
  }
}
