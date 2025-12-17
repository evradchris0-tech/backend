import { TypeMouvement } from '../enums';
import { Facture } from '../value-objects';

/**
 * Entité MouvementStock - Représente un mouvement d'équipement
 * Basé sur les documents d'enregistrement du stock matériel
 */
export class MouvementStock {
  private _id: string;
  private _equipementId: string;
  private _typeMouvement: TypeMouvement;
  private _quantite: number;
  private _quantiteAvant: number;
  private _quantiteApres: number;
  private _motif: string;
  private _reference?: string; // Numéro bon réception, bordereau...
  private _livreur?: string;
  private _serviceDestination?: string;
  private _utilisateurId: string; // Utilisateur ayant effectué le mouvement
  private _dateRetrait?: Date;
  private _dateReception?: Date;
  private _facture?: Facture;
  private _observations?: string;
  private _createdAt: Date;

  constructor(params: {
    id: string;
    equipementId: string;
    typeMouvement: TypeMouvement;
    quantite: number;
    quantiteAvant: number;
    quantiteApres: number;
    motif: string;
    utilisateurId: string;
    reference?: string;
    livreur?: string;
    serviceDestination?: string;
    dateRetrait?: Date;
    dateReception?: Date;
    facture?: Facture;
    observations?: string;
    createdAt?: Date;
  }) {
    this._id = params.id;
    this._equipementId = params.equipementId;
    this._typeMouvement = params.typeMouvement;
    this._quantite = params.quantite;
    this._quantiteAvant = params.quantiteAvant;
    this._quantiteApres = params.quantiteApres;
    this._motif = params.motif;
    this._utilisateurId = params.utilisateurId;
    this._reference = params.reference;
    this._livreur = params.livreur;
    this._serviceDestination = params.serviceDestination;
    this._dateRetrait = params.dateRetrait;
    this._dateReception = params.dateReception;
    this._facture = params.facture;
    this._observations = params.observations;
    this._createdAt = params.createdAt || new Date();

    this.validate();
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get equipementId(): string {
    return this._equipementId;
  }

  get typeMouvement(): TypeMouvement {
    return this._typeMouvement;
  }

  get quantite(): number {
    return this._quantite;
  }

  get quantiteAvant(): number {
    return this._quantiteAvant;
  }

  get quantiteApres(): number {
    return this._quantiteApres;
  }

  get motif(): string {
    return this._motif;
  }

  get reference(): string | undefined {
    return this._reference;
  }

  get livreur(): string | undefined {
    return this._livreur;
  }

  get serviceDestination(): string | undefined {
    return this._serviceDestination;
  }

  get utilisateurId(): string {
    return this._utilisateurId;
  }

  get dateRetrait(): Date | undefined {
    return this._dateRetrait;
  }

  get dateReception(): Date | undefined {
    return this._dateReception;
  }

  get facture(): Facture | undefined {
    return this._facture;
  }

  get observations(): string | undefined {
    return this._observations;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  // Business Methods

  /**
   * Vérifie si c'est un mouvement d'entrée
   */
  isEntree(): boolean {
    return [
      TypeMouvement.ENTREE_ACHAT,
      TypeMouvement.ENTREE_DON,
      TypeMouvement.ENTREE_RETOUR,
    ].includes(this._typeMouvement);
  }

  /**
   * Vérifie si c'est un mouvement de sortie
   */
  isSortie(): boolean {
    return [
      TypeMouvement.SORTIE_AFFECTATION,
      TypeMouvement.SORTIE_CONSOMMATION,
      TypeMouvement.SORTIE_PERTE,
      TypeMouvement.SORTIE_CASSE,
    ].includes(this._typeMouvement);
  }

  /**
   * Vérifie si c'est un transfert
   */
  isTransfert(): boolean {
    return this._typeMouvement === TypeMouvement.TRANSFERT;
  }

  /**
   * Vérifie si c'est une correction d'inventaire
   */
  isCorrection(): boolean {
    return this._typeMouvement === TypeMouvement.INVENTAIRE_CORRECTION;
  }

  /**
   * Ajoute ou met à jour des observations
   */
  ajouterObservation(observation: string): void {
    if (this._observations) {
      this._observations += `\n${observation}`;
    } else {
      this._observations = observation;
    }
  }

  /**
   * Validation
   */
  private validate(): void {
    if (this._quantite <= 0) {
      throw new Error('La quantité doit être supérieure à zéro');
    }

    if (this._quantiteAvant < 0) {
      throw new Error('La quantité avant ne peut pas être négative');
    }

    if (this._quantiteApres < 0) {
      throw new Error('La quantité après ne peut pas être négative');
    }

    if (!this._motif || this._motif.trim().length === 0) {
      throw new Error('Le motif ne peut pas être vide');
    }

    // Validation cohérence entrée/sortie
    if (this.isEntree()) {
      if (this._quantiteApres !== this._quantiteAvant + this._quantite) {
        throw new Error(
          'Incohérence: pour une entrée, quantiteApres doit = quantiteAvant + quantite',
        );
      }
    } else if (this.isSortie()) {
      if (this._quantiteApres !== this._quantiteAvant - this._quantite) {
        throw new Error(
          'Incohérence: pour une sortie, quantiteApres doit = quantiteAvant - quantite',
        );
      }
    }
  }
}
