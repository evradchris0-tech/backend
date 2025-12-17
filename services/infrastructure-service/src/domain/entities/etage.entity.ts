// src/domain/entities/etage.entity.ts

/**
 * Entite Etage - Appartient a l'agregat Batiment
 * Represente un niveau d'un batiment
 */
export class Etage {
    private _id: string;
    private _batimentId: string;
    private _numero: number;
    private _designation: string;
    private _superficie: number | null;
    private _planEtage: string | null;
    private _actif: boolean;
    private _dateCreation: Date;
    private _dateModification: Date;

    private constructor(params: EtageParams) {
        this._id = params.id;
        this._batimentId = params.batimentId;
        this._numero = params.numero;
        this._designation = params.designation;
        this._superficie = params.superficie ?? null;
        this._planEtage = params.planEtage ?? null;
        this._actif = params.actif ?? true;
        this._dateCreation = params.dateCreation ?? new Date();
        this._dateModification = params.dateModification ?? new Date();

        this.validate();
    }

    /**
     * Factory method pour creer un nouvel etage
     */
    public static create(params: CreateEtageParams): Etage {
        const designation =
            params.designation ?? Etage.genererDesignation(params.numero);

        return new Etage({
            id: params.id,
            batimentId: params.batimentId,
            numero: params.numero,
            designation: designation,
            superficie: params.superficie,
            planEtage: params.planEtage,
            actif: true,
            dateCreation: new Date(),
            dateModification: new Date(),
        });
    }

    /**
     * Reconstitue un etage depuis la persistence
     */
    public static fromPersistence(params: EtageParams): Etage {
        return new Etage(params);
    }

    /**
     * Genere une designation automatique basee sur le numero
     */
    public static genererDesignation(numero: number): string {
        if (numero < 0) {
            return `Sous-sol ${Math.abs(numero)}`;
        }
        if (numero === 0) {
            return 'Rez-de-chaussée';
        }
        if (numero === 1) {
            return '1er étage';
        }
        return `${numero}ème étage`;
    }

    // Getters
    get id(): string {
        return this._id;
    }

    get batimentId(): string {
        return this._batimentId;
    }

    get numero(): number {
        return this._numero;
    }

    get designation(): string {
        return this._designation;
    }

    get superficie(): number | null {
        return this._superficie;
    }

    get planEtage(): string | null {
        return this._planEtage;
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
     * Valide les invariants de l'etage
     */
    private validate(): void {
        if (!this._batimentId) {
            throw new Error("L'etage doit etre associe a un batiment");
        }
        if (!this._designation || this._designation.trim().length === 0) {
            throw new Error("La designation de l'etage est obligatoire");
        }
        if (this._superficie !== null && this._superficie <= 0) {
            throw new Error('La superficie doit etre positive');
        }
    }

    /**
     * Met a jour les informations de l'etage
     */
    public update(params: UpdateEtageParams): void {
        if (params.designation !== undefined) {
            this._designation = params.designation;
        }
        if (params.superficie !== undefined) {
            this._superficie = params.superficie;
        }
        if (params.planEtage !== undefined) {
            this._planEtage = params.planEtage;
        }

        this._dateModification = new Date();
        this.validate();
    }

    /**
     * Desactive l'etage (soft delete)
     */
    public desactiver(): void {
        this._actif = false;
        this._dateModification = new Date();
    }

    /**
     * Reactive l'etage
     */
    public reactiver(): void {
        this._actif = true;
        this._dateModification = new Date();
    }

    /**
     * Verifie si c'est un sous-sol
     */
    public estSousSol(): boolean {
        return this._numero < 0;
    }

    /**
     * Verifie si c'est le rez-de-chaussee
     */
    public estRezDeChaussee(): boolean {
        return this._numero === 0;
    }

    /**
     * Convertit en objet pour serialisation
     */
    public toObject(): EtageParams {
        return {
            id: this._id,
            batimentId: this._batimentId,
            numero: this._numero,
            designation: this._designation,
            superficie: this._superficie,
            planEtage: this._planEtage,
            actif: this._actif,
            dateCreation: this._dateCreation,
            dateModification: this._dateModification,
        };
    }
}

/**
 * Parametres complets pour la construction d'un etage
 */
export interface EtageParams {
    id: string;
    batimentId: string;
    numero: number;
    designation: string;
    superficie?: number | null;
    planEtage?: string | null;
    actif?: boolean;
    dateCreation?: Date;
    dateModification?: Date;
}

/**
 * Parametres pour creer un nouvel etage
 */
export interface CreateEtageParams {
    id: string;
    batimentId: string;
    numero: number;
    designation?: string;
    superficie?: number;
    planEtage?: string;
}

/**
 * Parametres pour mettre a jour un etage
 */
export interface UpdateEtageParams {
    designation?: string;
    superficie?: number | null;
    planEtage?: string | null;
}