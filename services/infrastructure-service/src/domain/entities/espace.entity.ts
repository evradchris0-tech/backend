// src/domain/entities/espace.entity.ts

import { TypeEspace, estUneChambre } from '../enums';

/**
 * Entite Espace - Appartient a l'agregat Batiment
 * Represente une chambre, salle de classe, bureau ou autre local
 */
export class Espace {
    private _id: string;
    private _etageId: string;
    private _numero: string;
    private _type: TypeEspace;
    private _superficie: number | null;
    private _capacite: number | null;
    private _description: string | null;
    private _estOccupe: boolean;
    private _occupantId: string | null;
    private _aEquipementDefectueux: boolean;
    private _nombreEquipementsDefectueux: number;
    private _actif: boolean;
    private _dateCreation: Date;
    private _dateModification: Date;

    private constructor(params: EspaceParams) {
        this._id = params.id;
        this._etageId = params.etageId;
        this._numero = params.numero;
        this._type = params.type;
        this._superficie = params.superficie ?? null;
        this._capacite = params.capacite ?? null;
        this._description = params.description ?? null;
        this._estOccupe = params.estOccupe ?? false;
        this._occupantId = params.occupantId ?? null;
        this._aEquipementDefectueux = params.aEquipementDefectueux ?? false;
        this._nombreEquipementsDefectueux = params.nombreEquipementsDefectueux ?? 0;
        this._actif = params.actif ?? true;
        this._dateCreation = params.dateCreation ?? new Date();
        this._dateModification = params.dateModification ?? new Date();

        this.validate();
    }

    /**
     * Factory method pour creer un nouvel espace
     */
    public static create(params: CreateEspaceParams): Espace {
        return new Espace({
            id: params.id,
            etageId: params.etageId,
            numero: params.numero,
            type: params.type,
            superficie: params.superficie,
            capacite: params.capacite ?? Espace.getCapaciteParDefaut(params.type),
            description: params.description,
            estOccupe: false,
            occupantId: null,
            aEquipementDefectueux: false,
            nombreEquipementsDefectueux: 0,
            actif: true,
            dateCreation: new Date(),
            dateModification: new Date(),
        });
    }

    /**
     * Reconstitue un espace depuis la persistence
     */
    public static fromPersistence(params: EspaceParams): Espace {
        return new Espace(params);
    }

    /**
     * Retourne la capacite par defaut selon le type d'espace
     */
    public static getCapaciteParDefaut(type: TypeEspace): number {
        const capacites: Partial<Record<TypeEspace, number>> = {
            [TypeEspace.CHAMBRE_SIMPLE]: 1,
            [TypeEspace.CHAMBRE_DOUBLE]: 2,
            [TypeEspace.CHAMBRE_TRIPLE]: 3,
            [TypeEspace.BUREAU_INDIVIDUEL]: 1,
            [TypeEspace.BUREAU_PARTAGE]: 4,
            [TypeEspace.SALLE_CLASSE]: 30,
            [TypeEspace.AMPHITHEATRE]: 100,
            [TypeEspace.SALLE_REUNION]: 10,
            [TypeEspace.LABORATOIRE]: 20,
        };
        return capacites[type] ?? 1;
    }

    // Getters
    get id(): string {
        return this._id;
    }

    get etageId(): string {
        return this._etageId;
    }

    get numero(): string {
        return this._numero;
    }

    get type(): TypeEspace {
        return this._type;
    }

    get superficie(): number | null {
        return this._superficie;
    }

    get capacite(): number | null {
        return this._capacite;
    }

    get description(): string | null {
        return this._description;
    }

    get estOccupe(): boolean {
        return this._estOccupe;
    }

    get occupantId(): string | null {
        return this._occupantId;
    }

    get aEquipementDefectueux(): boolean {
        return this._aEquipementDefectueux;
    }

    get nombreEquipementsDefectueux(): number {
        return this._nombreEquipementsDefectueux;
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
     * Valide les invariants de l'espace
     */
    private validate(): void {
        if (!this._etageId) {
            throw new Error("L'espace doit etre associe a un etage");
        }
        if (!this._numero || this._numero.trim().length === 0) {
            throw new Error("Le numero de l'espace est obligatoire");
        }
        if (this._superficie !== null && this._superficie <= 0) {
            throw new Error('La superficie doit etre positive');
        }
        if (this._capacite !== null && this._capacite <= 0) {
            throw new Error('La capacite doit etre positive');
        }
        // Un espace non-chambre ne peut pas etre occupe
        if (this._estOccupe && !this.estUneChambre()) {
            throw new Error("Seules les chambres peuvent etre marquees comme occupees");
        }
    }

    /**
     * Met a jour les informations de l'espace
     */
    public update(params: UpdateEspaceParams): void {
        if (params.numero !== undefined) {
            this._numero = params.numero;
        }
        if (params.type !== undefined) {
            this._type = params.type;
        }
        if (params.superficie !== undefined) {
            this._superficie = params.superficie;
        }
        if (params.capacite !== undefined) {
            this._capacite = params.capacite;
        }
        if (params.description !== undefined) {
            this._description = params.description;
        }

        this._dateModification = new Date();
        this.validate();
    }

    /**
     * Verifie si l'espace est une chambre
     */
    public estUneChambre(): boolean {
        return estUneChambre(this._type);
    }

    /**
     * Assigne un occupant a l'espace (chambres uniquement)
     */
    public assignerOccupant(occupantId: string): void {
        if (!this.estUneChambre()) {
            throw new Error("Seules les chambres peuvent avoir un occupant");
        }
        if (this._estOccupe && this._occupantId !== occupantId) {
            throw new Error("L'espace est deja occupe par un autre occupant");
        }
        this._occupantId = occupantId;
        this._estOccupe = true;
        this._dateModification = new Date();
    }

    /**
     * Libere l'espace (retire l'occupant)
     */
    public liberer(): void {
        this._occupantId = null;
        this._estOccupe = false;
        this._dateModification = new Date();
    }

    /**
     * Met a jour le compteur d'equipements defectueux
     * Cette methode est appelee par le service quand le statut d'un equipement change
     */
    public mettreAJourEquipementsDefectueux(nombreDefectueux: number): void {
        this._nombreEquipementsDefectueux = Math.max(0, nombreDefectueux);
        this._aEquipementDefectueux = this._nombreEquipementsDefectueux > 0;
        this._dateModification = new Date();
    }

    /**
     * Incremente le compteur d'equipements defectueux
     */
    public incrementerEquipementsDefectueux(): void {
        this._nombreEquipementsDefectueux++;
        this._aEquipementDefectueux = true;
        this._dateModification = new Date();
    }

    /**
     * Decremente le compteur d'equipements defectueux
     */
    public decrementerEquipementsDefectueux(): void {
        this._nombreEquipementsDefectueux = Math.max(0, this._nombreEquipementsDefectueux - 1);
        this._aEquipementDefectueux = this._nombreEquipementsDefectueux > 0;
        this._dateModification = new Date();
    }

    /**
     * Desactive l'espace (soft delete)
     */
    public desactiver(): void {
        if (this._estOccupe) {
            throw new Error("Impossible de desactiver un espace occupe");
        }
        this._actif = false;
        this._dateModification = new Date();
    }

    /**
     * Reactive l'espace
     */
    public reactiver(): void {
        this._actif = true;
        this._dateModification = new Date();
    }

    /**
     * Verifie si l'espace peut accueillir un nouvel equipement
     */
    public peutAccueillirEquipement(): boolean {
        return this._actif;
    }

    /**
     * Convertit en objet pour serialisation
     */
    public toObject(): EspaceParams {
        return {
            id: this._id,
            etageId: this._etageId,
            numero: this._numero,
            type: this._type,
            superficie: this._superficie,
            capacite: this._capacite,
            description: this._description,
            estOccupe: this._estOccupe,
            occupantId: this._occupantId,
            aEquipementDefectueux: this._aEquipementDefectueux,
            nombreEquipementsDefectueux: this._nombreEquipementsDefectueux,
            actif: this._actif,
            dateCreation: this._dateCreation,
            dateModification: this._dateModification,
        };
    }
}

/**
 * Parametres complets pour la construction d'un espace
 */
export interface EspaceParams {
    id: string;
    etageId: string;
    numero: string;
    type: TypeEspace;
    superficie?: number | null;
    capacite?: number | null;
    description?: string | null;
    estOccupe?: boolean;
    occupantId?: string | null;
    aEquipementDefectueux?: boolean;
    nombreEquipementsDefectueux?: number;
    actif?: boolean;
    dateCreation?: Date;
    dateModification?: Date;
}

/**
 * Parametres pour creer un nouvel espace
 */
export interface CreateEspaceParams {
    id: string;
    etageId: string;
    numero: string;
    type: TypeEspace;
    superficie?: number;
    capacite?: number;
    description?: string;
}

/**
 * Parametres pour mettre a jour un espace
 */
export interface UpdateEspaceParams {
    numero?: string;
    type?: TypeEspace;
    superficie?: number | null;
    capacite?: number | null;
    description?: string | null;
}