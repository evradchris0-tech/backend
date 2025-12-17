// src/domain/entities/batiment.entity.ts

import { TypeBatiment } from '../enums';
import { Coordonnees } from '../value-objects';

/**
 * Entite Batiment - Aggregate Root de l'infrastructure
 * Represente un batiment physique du campus IUSJC
 * Contient la logique metier et les invariants du domaine
 */
export class Batiment {
    private _id: string;
    private _nom: string;
    private _code: string;
    private _type: TypeBatiment;
    private _adresse: string | null;
    private _coordonnees: Coordonnees | null;
    private _nombreEtages: number;
    private _superficie: number | null;
    private _dateConstruction: Date | null;
    private _description: string | null;
    private _planBatiment: string | null;
    private _actif: boolean;
    private _dateCreation: Date;
    private _dateModification: Date;

    private constructor(params: BatimentParams) {
        this._id = params.id;
        this._nom = params.nom;
        this._code = params.code;
        this._type = params.type;
        this._adresse = params.adresse ?? null;
        this._coordonnees = params.coordonnees ?? null;
        this._nombreEtages = params.nombreEtages ?? 1;
        this._superficie = params.superficie ?? null;
        this._dateConstruction = params.dateConstruction ?? null;
        this._description = params.description ?? null;
        this._planBatiment = params.planBatiment ?? null;
        this._actif = params.actif ?? true;
        this._dateCreation = params.dateCreation ?? new Date();
        this._dateModification = params.dateModification ?? new Date();

        this.validate();
    }

    /**
     * Factory method pour creer un nouveau batiment
     */
    public static create(params: CreateBatimentParams): Batiment {
        return new Batiment({
            id: params.id,
            nom: params.nom,
            code: params.code.toUpperCase(),
            type: params.type,
            adresse: params.adresse,
            coordonnees: params.coordonnees,
            nombreEtages: params.nombreEtages,
            superficie: params.superficie,
            dateConstruction: params.dateConstruction,
            description: params.description,
            planBatiment: params.planBatiment,
            actif: true,
            dateCreation: new Date(),
            dateModification: new Date(),
        });
    }

    /**
     * Reconstitue un batiment depuis la persistence
     */
    public static fromPersistence(params: BatimentParams): Batiment {
        return new Batiment(params);
    }

    // Getters
    get id(): string {
        return this._id;
    }

    get nom(): string {
        return this._nom;
    }

    get code(): string {
        return this._code;
    }

    get type(): TypeBatiment {
        return this._type;
    }

    get adresse(): string | null {
        return this._adresse;
    }

    get coordonnees(): Coordonnees | null {
        return this._coordonnees;
    }

    get nombreEtages(): number {
        return this._nombreEtages;
    }

    get superficie(): number | null {
        return this._superficie;
    }

    get dateConstruction(): Date | null {
        return this._dateConstruction;
    }

    get description(): string | null {
        return this._description;
    }

    get planBatiment(): string | null {
        return this._planBatiment;
    }

    get actif(): boolean {
        return this._actif;
    }

    get dateCreation(): Date {
        return this._dateCreation;
    }

    get dateModification(): Date {
        return this._dateModification;
    }

    /**
     * Valide les invariants du batiment
     */
    private validate(): void {
        if (!this._nom || this._nom.trim().length < 2) {
            throw new Error('Le nom du batiment doit contenir au moins 2 caracteres');
        }
        if (!this._code || this._code.trim().length < 2) {
            throw new Error('Le code du batiment doit contenir au moins 2 caracteres');
        }
        if (this._nombreEtages < 1) {
            throw new Error('Un batiment doit avoir au moins 1 etage');
        }
        if (this._superficie !== null && this._superficie <= 0) {
            throw new Error('La superficie doit etre positive');
        }
    }

    /**
     * Met a jour les informations du batiment
     */
    public update(params: UpdateBatimentParams): void {
        if (params.nom !== undefined) {
            this._nom = params.nom;
        }
        if (params.type !== undefined) {
            this._type = params.type;
        }
        if (params.adresse !== undefined) {
            this._adresse = params.adresse;
        }
        if (params.coordonnees !== undefined) {
            this._coordonnees = params.coordonnees;
        }
        if (params.nombreEtages !== undefined) {
            this._nombreEtages = params.nombreEtages;
        }
        if (params.superficie !== undefined) {
            this._superficie = params.superficie;
        }
        if (params.description !== undefined) {
            this._description = params.description;
        }
        if (params.planBatiment !== undefined) {
            this._planBatiment = params.planBatiment;
        }

        this._dateModification = new Date();
        this.validate();
    }

    /**
     * Definit les coordonnees GPS du batiment
     */
    public setCoordonnees(latitude: number, longitude: number, altitude?: number): void {
        this._coordonnees = Coordonnees.create(latitude, longitude, altitude);
        this._dateModification = new Date();
    }

    /**
     * Desactive le batiment (soft delete)
     */
    public desactiver(): void {
        this._actif = false;
        this._dateModification = new Date();
    }

    /**
     * Reactive le batiment
     */
    public reactiver(): void {
        this._actif = true;
        this._dateModification = new Date();
    }

    /**
     * Verifie si le batiment est une residence (Cite U ou residence personnel)
     */
    public estResidence(): boolean {
        return (
            this._type === TypeBatiment.CITE_UNIVERSITAIRE ||
            this._type === TypeBatiment.RESIDENCE_PERSONNEL
        );
    }

    /**
     * Verifie si le batiment est pedagogique
     */
    public estPedagogique(): boolean {
        return (
            this._type === TypeBatiment.PEDAGOGIQUE ||
            this._type === TypeBatiment.MIXTE
        );
    }

    /**
     * Calcule l'age du batiment en annees
     */
    public getAgeEnAnnees(): number | null {
        if (!this._dateConstruction) {
            return null;
        }
        const diff = Date.now() - this._dateConstruction.getTime();
        return Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
    }

    /**
     * Convertit en objet pour serialisation
     */
    public toObject(): BatimentParams {
        return {
            id: this._id,
            nom: this._nom,
            code: this._code,
            type: this._type,
            adresse: this._adresse,
            coordonnees: this._coordonnees,
            nombreEtages: this._nombreEtages,
            superficie: this._superficie,
            dateConstruction: this._dateConstruction,
            description: this._description,
            planBatiment: this._planBatiment,
            actif: this._actif,
            dateCreation: this._dateCreation,
            dateModification: this._dateModification,
        };
    }
}

/**
 * Parametres complets pour la construction d'un batiment
 */
export interface BatimentParams {
    id: string;
    nom: string;
    code: string;
    type: TypeBatiment;
    adresse?: string | null;
    coordonnees?: Coordonnees | null;
    nombreEtages?: number;
    superficie?: number | null;
    dateConstruction?: Date | null;
    description?: string | null;
    planBatiment?: string | null;
    actif?: boolean;
    dateCreation?: Date;
    dateModification?: Date;
}

/**
 * Parametres pour creer un nouveau batiment
 */
export interface CreateBatimentParams {
    id: string;
    nom: string;
    code: string;
    type: TypeBatiment;
    adresse?: string;
    coordonnees?: Coordonnees;
    nombreEtages?: number;
    superficie?: number;
    dateConstruction?: Date;
    description?: string;
    planBatiment?: string;
}

/**
 * Parametres pour mettre a jour un batiment
 */
export interface UpdateBatimentParams {
    nom?: string;
    type?: TypeBatiment;
    adresse?: string | null;
    coordonnees?: Coordonnees | null;
    nombreEtages?: number;
    superficie?: number | null;
    description?: string | null;
    planBatiment?: string | null;
}