import { EtatAffectation } from '../enums';

/**
 * Entité Affectation - Représente l'affectation d'un équipement
 */
export class Affectation {
  private _id: string;
  private _equipementId: string;
  private _quantite: number;
  private _serviceBeneficiaire: string;
  private _utilisateurBeneficiaire: string;
  private _dateAffectation: Date;
  private _dateRetourPrevu?: Date;
  private _dateRetourEffectif?: Date;
  private _etat: EtatAffectation;
  private _observations?: string;
  private _motifRetrait?: string;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(params: {
    id: string;
    equipementId: string;
    quantite: number;
    serviceBeneficiaire: string;
    utilisateurBeneficiaire: string;
    dateAffectation?: Date;
    dateRetourPrevu?: Date;
    dateRetourEffectif?: Date;
    etat?: EtatAffectation;
    observations?: string;
    motifRetrait?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this._id = params.id;
    this._equipementId = params.equipementId;
    this._quantite = params.quantite;
    this._serviceBeneficiaire = params.serviceBeneficiaire;
    this._utilisateurBeneficiaire = params.utilisateurBeneficiaire;
    this._dateAffectation = params.dateAffectation || new Date();
    this._dateRetourPrevu = params.dateRetourPrevu;
    this._dateRetourEffectif = params.dateRetourEffectif;
    this._etat = params.etat || EtatAffectation.ACTIVE;
    this._observations = params.observations;
    this._motifRetrait = params.motifRetrait;
    this._createdAt = params.createdAt || new Date();
    this._updatedAt = params.updatedAt || new Date();

    this.validate();
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get equipementId(): string {
    return this._equipementId;
  }

  get quantite(): number {
    return this._quantite;
  }

  get serviceBeneficiaire(): string {
    return this._serviceBeneficiaire;
  }

  get utilisateurBeneficiaire(): string {
    return this._utilisateurBeneficiaire;
  }

  get dateAffectation(): Date {
    return this._dateAffectation;
  }

  get dateRetourPrevu(): Date | undefined {
    return this._dateRetourPrevu;
  }

  get dateRetourEffectif(): Date | undefined {
    return this._dateRetourEffectif;
  }

  get etat(): EtatAffectation {
    return this._etat;
  }

  get observations(): string | undefined {
    return this._observations;
  }

  get motifRetrait(): string | undefined {
    return this._motifRetrait;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  // Business Methods

  /**
   * Vérifie si l'affectation est active
   */
  isActive(): boolean {
    return this._etat === EtatAffectation.ACTIVE;
  }

  /**
   * Vérifie si le retour est en retard
   */
  isEnRetard(): boolean {
    if (!this._dateRetourPrevu || !this.isActive()) {
      return false;
    }
    return new Date() > this._dateRetourPrevu;
  }

  /**
   * Enregistre le retour de l'équipement
   */
  enregistrerRetour(
    etat: EtatAffectation,
    dateRetour?: Date,
    motif?: string,
  ): void {
    if (!this.isActive()) {
      throw new Error('Cette affectation est déjà terminée');
    }

    if (
      etat !== EtatAffectation.RETOURNEE &&
      etat !== EtatAffectation.PERDUE &&
      etat !== EtatAffectation.ENDOMMAGEE
    ) {
      throw new Error("État de retour invalide (doit être RETOURNEE, PERDUE ou ENDOMMAGEE)");
    }

    this._etat = etat;
    this._dateRetourEffectif = dateRetour || new Date();
    if (motif) {
      this._motifRetrait = motif;
    }
    this._updatedAt = new Date();
  }

  /**
   * Prolonge la date de retour prévue
   */
  prolongerRetour(nouvelleDate: Date, motif?: string): void {
    if (!this.isActive()) {
      throw new Error('Cette affectation est déjà terminée');
    }

    if (nouvelleDate <= new Date()) {
      throw new Error('La nouvelle date doit être dans le futur');
    }

    this._dateRetourPrevu = nouvelleDate;
    if (motif) {
      this.ajouterObservation(`Prolongation: ${motif}`);
    }
    this._updatedAt = new Date();
  }

  /**
   * Ajoute une observation
   */
  ajouterObservation(observation: string): void {
    if (this._observations) {
      this._observations += `\n${observation}`;
    } else {
      this._observations = observation;
    }
    this._updatedAt = new Date();
  }

  /**
   * Calcule la durée d'affectation en jours
   */
  getDureeAffectation(): number {
    const dateFin = this._dateRetourEffectif || new Date();
    const diffMs = dateFin.getTime() - this._dateAffectation.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }

  /**
   * Validation
   */
  private validate(): void {
    if (this._quantite <= 0) {
      throw new Error('La quantité doit être supérieure à zéro');
    }

    if (
      !this._serviceBeneficiaire ||
      this._serviceBeneficiaire.trim().length === 0
    ) {
      throw new Error('Le service bénéficiaire ne peut pas être vide');
    }

    if (
      !this._utilisateurBeneficiaire ||
      this._utilisateurBeneficiaire.trim().length === 0
    ) {
      throw new Error("L'utilisateur bénéficiaire ne peut pas être vide");
    }

    if (
      this._dateRetourPrevu &&
      this._dateRetourPrevu < this._dateAffectation
    ) {
      throw new Error(
        "La date de retour prévue ne peut pas être antérieure à la date d'affectation",
      );
    }

    if (
      this._dateRetourEffectif &&
      this._dateRetourEffectif < this._dateAffectation
    ) {
      throw new Error(
        "La date de retour effectif ne peut pas être antérieure à la date d'affectation",
      );
    }
  }
}
