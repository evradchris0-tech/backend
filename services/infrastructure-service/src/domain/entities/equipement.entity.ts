// src/domain/entities/equipement.entity.ts

import {
    TypeEquipement,
    StatutEquipement,
    estTransitionValide,
    estStatutDefectueux,
    estEquipementCritique,
    DUREE_VIE_ESTIMEE,
    getCategorie,
    CategorieEquipement,
} from '../enums';

/**
 * Entite Equipement - Gere le cycle de vie complet d'un equipement
 * Contient la logique metier pour les changements de statut,
 * l'historique des pannes et le calcul de risque
 */
export class Equipement {
    private _id: string;
    private _type: TypeEquipement;
    private _marque: string | null;
    private _modele: string | null;
    private _numeroSerie: string | null;
    private _statut: StatutEquipement;
    private _espaceId: string | null;
    private _dateAcquisition: Date | null;
    private _valeurAchat: number | null;
    private _description: string | null;
    private _historiquePannes: number;
    private _derniereDatePanne: Date | null;
    private _dateInstallation: Date | null;
    private _dateDerniereIntervention: Date | null;
    private _actif: boolean;
    private _dateCreation: Date;
    private _dateModification: Date;
    private _historiqueStatuts: HistoriqueStatut[];

    private constructor(params: EquipementParams) {
        this._id = params.id;
        this._type = params.type;
        this._marque = params.marque ?? null;
        this._modele = params.modele ?? null;
        this._numeroSerie = params.numeroSerie ?? null;
        this._statut = params.statut ?? StatutEquipement.BON_ETAT;
        this._espaceId = params.espaceId ?? null;
        this._dateAcquisition = params.dateAcquisition ?? null;
        this._valeurAchat = params.valeurAchat ?? null;
        this._description = params.description ?? null;
        this._historiquePannes = params.historiquePannes ?? 0;
        this._derniereDatePanne = params.derniereDatePanne ?? null;
        this._dateInstallation = params.dateInstallation ?? null;
        this._dateDerniereIntervention = params.dateDerniereIntervention ?? null;
        this._actif = params.actif ?? true;
        this._dateCreation = params.dateCreation ?? new Date();
        this._dateModification = params.dateModification ?? new Date();
        this._historiqueStatuts = params.historiqueStatuts ?? [];

        this.validate();
    }

    /**
     * Factory method pour creer un nouvel equipement
     */
    public static create(params: CreateEquipementParams): Equipement {
        const equipement = new Equipement({
            id: params.id,
            type: params.type,
            marque: params.marque,
            modele: params.modele,
            numeroSerie: params.numeroSerie,
            statut: StatutEquipement.BON_ETAT,
            espaceId: params.espaceId,
            dateAcquisition: params.dateAcquisition,
            valeurAchat: params.valeurAchat,
            description: params.description,
            historiquePannes: 0,
            derniereDatePanne: null,
            dateInstallation: params.espaceId ? new Date() : null,
            dateDerniereIntervention: null,
            actif: true,
            dateCreation: new Date(),
            dateModification: new Date(),
            historiqueStatuts: [],
        });

        // Enregistrer le statut initial dans l'historique
        equipement.ajouterHistoriqueStatut(
            null,
            StatutEquipement.BON_ETAT,
            'Creation de l\'equipement',
        );

        return equipement;
    }

    /**
     * Reconstitue un equipement depuis la persistence
     */
    public static fromPersistence(params: EquipementParams): Equipement {
        return new Equipement(params);
    }

    // Getters
    get id(): string {
        return this._id;
    }

    get type(): TypeEquipement {
        return this._type;
    }

    get marque(): string | null {
        return this._marque;
    }

    get modele(): string | null {
        return this._modele;
    }

    get numeroSerie(): string | null {
        return this._numeroSerie;
    }

    get statut(): StatutEquipement {
        return this._statut;
    }

    get espaceId(): string | null {
        return this._espaceId;
    }

    get dateAcquisition(): Date | null {
        return this._dateAcquisition;
    }

    get valeurAchat(): number | null {
        return this._valeurAchat;
    }

    get description(): string | null {
        return this._description;
    }

    get historiquePannes(): number {
        return this._historiquePannes;
    }

    get derniereDatePanne(): Date | null {
        return this._derniereDatePanne;
    }

    get dateInstallation(): Date | null {
        return this._dateInstallation;
    }

    get dateDerniereIntervention(): Date | null {
        return this._dateDerniereIntervention;
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

    get historiqueStatuts(): HistoriqueStatut[] {
        return [...this._historiqueStatuts];
    }

    /**
     * Valide les invariants de l'equipement
     */
    private validate(): void {
        if (this._valeurAchat !== null && this._valeurAchat < 0) {
            throw new Error('La valeur d\'achat ne peut pas etre negative');
        }
        if (this._historiquePannes < 0) {
            throw new Error('L\'historique des pannes ne peut pas etre negatif');
        }
    }

    /**
     * Met a jour les informations de l'equipement
     */
    public update(params: UpdateEquipementParams): void {
        if (params.marque !== undefined) {
            this._marque = params.marque;
        }
        if (params.modele !== undefined) {
            this._modele = params.modele;
        }
        if (params.numeroSerie !== undefined) {
            this._numeroSerie = params.numeroSerie;
        }
        if (params.dateAcquisition !== undefined) {
            this._dateAcquisition = params.dateAcquisition;
        }
        if (params.valeurAchat !== undefined) {
            this._valeurAchat = params.valeurAchat;
        }
        if (params.description !== undefined) {
            this._description = params.description;
        }

        this._dateModification = new Date();
        this.validate();
    }

    /**
     * Change le statut de l'equipement avec validation des transitions
     * @returns true si le changement implique une defectuosite (pour notifier l'espace)
     */
    public changerStatut(
        nouveauStatut: StatutEquipement,
        motif: string,
    ): ChangementStatutResult {
        const ancienStatut = this._statut;

        // Verifier si la transition est valide
        if (!estTransitionValide(ancienStatut, nouveauStatut)) {
            throw new Error(
                `Transition de statut invalide: ${ancienStatut} -> ${nouveauStatut}`,
            );
        }

        // Pas de changement si meme statut
        if (ancienStatut === nouveauStatut) {
            return {
                aChange: false,
                ancienStatut,
                nouveauStatut,
                devientDefectueux: false,
                devientFonctionnel: false,
            };
        }

        const etaitDefectueux = estStatutDefectueux(ancienStatut);
        const devientDefectueux = estStatutDefectueux(nouveauStatut);

        // Mettre a jour le statut
        this._statut = nouveauStatut;
        this._dateModification = new Date();

        // Mettre a jour l'historique des pannes si necessaire
        if (
            nouveauStatut === StatutEquipement.A_REPARER ||
            nouveauStatut === StatutEquipement.A_REMPLACER
        ) {
            this._historiquePannes++;
            this._derniereDatePanne = new Date();
        }

        // Mettre a jour la date de derniere intervention
        if (
            ancienStatut === StatutEquipement.EN_MAINTENANCE &&
            nouveauStatut === StatutEquipement.BON_ETAT
        ) {
            this._dateDerniereIntervention = new Date();
        }

        // Enregistrer dans l'historique
        this.ajouterHistoriqueStatut(ancienStatut, nouveauStatut, motif);

        return {
            aChange: true,
            ancienStatut,
            nouveauStatut,
            devientDefectueux: !etaitDefectueux && devientDefectueux,
            devientFonctionnel: etaitDefectueux && !devientDefectueux,
        };
    }

    /**
     * Assigne l'equipement a un espace
     */
    public assignerAEspace(espaceId: string): void {
        if (this._statut === StatutEquipement.HORS_SERVICE) {
            throw new Error('Un equipement hors service ne peut pas etre assigne');
        }
        this._espaceId = espaceId;
        this._dateInstallation = new Date();
        this._dateModification = new Date();
    }

    /**
     * Retire l'equipement de son espace actuel
     */
    public retirerDeEspace(): void {
        this._espaceId = null;
        this._dateModification = new Date();
    }

    /**
     * Verifie si l'equipement est actuellement defectueux
     */
    public estDefectueux(): boolean {
        return estStatutDefectueux(this._statut);
    }

    /**
     * Verifie si l'equipement est critique pour la securite
     */
    public estCritique(): boolean {
        return estEquipementCritique(this._type);
    }

    /**
     * Retourne la categorie de l'equipement
     */
    public getCategorie(): CategorieEquipement {
        return getCategorie(this._type);
    }

    /**
     * Calcule l'age de l'equipement en mois depuis l'acquisition
     */
    public getAgeEnMois(): number | null {
        if (!this._dateAcquisition) {
            return null;
        }
        const diff = Date.now() - this._dateAcquisition.getTime();
        return Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
    }

    /**
     * Calcule le pourcentage de vie restante estimee
     */
    public getPourcentageVieRestante(): number | null {
        const ageEnMois = this.getAgeEnMois();
        if (ageEnMois === null) {
            return null;
        }
        const dureeVie = DUREE_VIE_ESTIMEE[this._type];
        const pourcentage = Math.max(0, (1 - ageEnMois / dureeVie) * 100);
        return Math.round(pourcentage * 10) / 10;
    }

    /**
     * Calcule le taux de panne (pannes par an d'utilisation)
     */
    public getTauxPanneAnnuel(): number | null {
        const ageEnMois = this.getAgeEnMois();
        if (ageEnMois === null || ageEnMois < 1) {
            return null;
        }
        return Math.round((this._historiquePannes / (ageEnMois / 12)) * 100) / 100;
    }

    /**
     * Calcule un score de risque de panne (0-100)
     * Utilise pour les predictions ML
     */
    public calculerScoreRisque(): number {
        let score = 0;

        // Facteur 1: Age vs duree de vie estimee (0-30 points)
        const pourcentageVie = this.getPourcentageVieRestante();
        if (pourcentageVie !== null) {
            score += Math.round((100 - pourcentageVie) * 0.3);
        }

        // Facteur 2: Historique des pannes (0-30 points)
        score += Math.min(30, this._historiquePannes * 5);

        // Facteur 3: Statut actuel (0-25 points)
        const pointsStatut: Partial<Record<StatutEquipement, number>> = {
            [StatutEquipement.BON_ETAT]: 0,
            [StatutEquipement.EN_MAINTENANCE]: 10,
            [StatutEquipement.EN_ATTENTE_PIECE]: 15,
            [StatutEquipement.A_REPARER]: 20,
            [StatutEquipement.A_REMPLACER]: 25,
        };
        score += pointsStatut[this._statut] ?? 0;

        // Facteur 4: Temps depuis derniere panne (0-15 points)
        if (this._derniereDatePanne) {
            const moisDepuisPanne =
                (Date.now() - this._derniereDatePanne.getTime()) / (1000 * 60 * 60 * 24 * 30);
            if (moisDepuisPanne < 3) {
                score += 15;
            } else if (moisDepuisPanne < 6) {
                score += 10;
            } else if (moisDepuisPanne < 12) {
                score += 5;
            }
        }

        return Math.min(100, score);
    }

    /**
     * Verifie si l'equipement necessite un remplacement base sur les indicateurs
     */
    public necessiteRemplacement(): boolean {
        // Deja marque a remplacer ou hors service
        if (
            this._statut === StatutEquipement.A_REMPLACER ||
            this._statut === StatutEquipement.HORS_SERVICE
        ) {
            return true;
        }

        // Score de risque tres eleve
        if (this.calculerScoreRisque() >= 80) {
            return true;
        }

        // Vie restante tres faible
        const vieRestante = this.getPourcentageVieRestante();
        if (vieRestante !== null && vieRestante < 10) {
            return true;
        }

        // Trop de pannes recurrentes
        if (this._historiquePannes >= 5) {
            return true;
        }

        return false;
    }

    /**
     * Desactive l'equipement (soft delete)
     */
    public desactiver(): void {
        this._actif = false;
        this._dateModification = new Date();
    }

    /**
     * Ajoute une entree dans l'historique des statuts
     */
    private ajouterHistoriqueStatut(
        ancienStatut: StatutEquipement | null,
        nouveauStatut: StatutEquipement,
        motif: string,
    ): void {
        this._historiqueStatuts.push({
            ancienStatut,
            nouveauStatut,
            motif,
            date: new Date(),
        });
    }

    /**
     * Convertit en objet pour serialisation
     */
    public toObject(): EquipementParams {
        return {
            id: this._id,
            type: this._type,
            marque: this._marque,
            modele: this._modele,
            numeroSerie: this._numeroSerie,
            statut: this._statut,
            espaceId: this._espaceId,
            dateAcquisition: this._dateAcquisition,
            valeurAchat: this._valeurAchat,
            description: this._description,
            historiquePannes: this._historiquePannes,
            derniereDatePanne: this._derniereDatePanne,
            dateInstallation: this._dateInstallation,
            dateDerniereIntervention: this._dateDerniereIntervention,
            actif: this._actif,
            dateCreation: this._dateCreation,
            dateModification: this._dateModification,
            historiqueStatuts: this._historiqueStatuts,
        };
    }
}

/**
 * Enregistrement d'un changement de statut
 */
export interface HistoriqueStatut {
    ancienStatut: StatutEquipement | null;
    nouveauStatut: StatutEquipement;
    motif: string;
    date: Date;
}

/**
 * Resultat d'un changement de statut
 */
export interface ChangementStatutResult {
    aChange: boolean;
    ancienStatut: StatutEquipement;
    nouveauStatut: StatutEquipement;
    devientDefectueux: boolean;
    devientFonctionnel: boolean;
}

/**
 * Parametres complets pour la construction d'un equipement
 */
export interface EquipementParams {
    id: string;
    type: TypeEquipement;
    marque?: string | null;
    modele?: string | null;
    numeroSerie?: string | null;
    statut?: StatutEquipement;
    espaceId?: string | null;
    dateAcquisition?: Date | null;
    valeurAchat?: number | null;
    description?: string | null;
    historiquePannes?: number;
    derniereDatePanne?: Date | null;
    dateInstallation?: Date | null;
    dateDerniereIntervention?: Date | null;
    actif?: boolean;
    dateCreation?: Date;
    dateModification?: Date;
    historiqueStatuts?: HistoriqueStatut[];
}

/**
 * Parametres pour creer un nouvel equipement
 */
export interface CreateEquipementParams {
    id: string;
    type: TypeEquipement;
    marque?: string;
    modele?: string;
    numeroSerie?: string;
    espaceId?: string;
    dateAcquisition?: Date;
    valeurAchat?: number;
    description?: string;
}

/**
 * Parametres pour mettre a jour un equipement
 */
export interface UpdateEquipementParams {
    marque?: string | null;
    modele?: string | null;
    numeroSerie?: string | null;
    dateAcquisition?: Date | null;
    valeurAchat?: number | null;
    description?: string | null;
}