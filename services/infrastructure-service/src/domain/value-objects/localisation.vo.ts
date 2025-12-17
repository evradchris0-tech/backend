// src/domain/value-objects/localisation.vo.ts

import { TypeEspace } from '../enums';

/**
 * Value Object representant une localisation complete dans la hierarchie
 * Batiment > Etage > Espace
 * Immutable - utilisé pour l'affichage et les recherches
 */
export class Localisation {
    private constructor(
        private readonly _batimentId: string,
        private readonly _batimentNom: string,
        private readonly _batimentCode: string,
        private readonly _etageId: string,
        private readonly _etageNumero: number,
        private readonly _etageDesignation: string,
        private readonly _espaceId?: string,
        private readonly _espaceNumero?: string,
        private readonly _espaceType?: TypeEspace,
    ) {}

    /**
     * Factory method pour creer une localisation complete
     */
    public static create(params: {
        batimentId: string;
        batimentNom: string;
        batimentCode: string;
        etageId: string;
        etageNumero: number;
        etageDesignation: string;
        espaceId?: string;
        espaceNumero?: string;
        espaceType?: TypeEspace;
    }): Localisation {
        return new Localisation(
            params.batimentId,
            params.batimentNom,
            params.batimentCode,
            params.etageId,
            params.etageNumero,
            params.etageDesignation,
            params.espaceId,
            params.espaceNumero,
            params.espaceType,
        );
    }

    /**
     * Cree une localisation au niveau batiment uniquement
     */
    public static batimentSeulement(params: {
        batimentId: string;
        batimentNom: string;
        batimentCode: string;
    }): Localisation {
        return new Localisation(
            params.batimentId,
            params.batimentNom,
            params.batimentCode,
            '',
            0,
            '',
        );
    }

    // Getters
    get batimentId(): string {
        return this._batimentId;
    }

    get batimentNom(): string {
        return this._batimentNom;
    }

    get batimentCode(): string {
        return this._batimentCode;
    }

    get etageId(): string {
        return this._etageId;
    }

    get etageNumero(): number {
        return this._etageNumero;
    }

    get etageDesignation(): string {
        return this._etageDesignation;
    }

    get espaceId(): string | undefined {
        return this._espaceId;
    }

    get espaceNumero(): string | undefined {
        return this._espaceNumero;
    }

    get espaceType(): TypeEspace | undefined {
        return this._espaceType;
    }

    /**
     * Verifie si la localisation inclut un espace
     */
    public hasEspace(): boolean {
        return this._espaceId !== undefined && this._espaceId !== '';
    }

    /**
     * Verifie si la localisation inclut un etage
     */
    public hasEtage(): boolean {
        return this._etageId !== undefined && this._etageId !== '';
    }

    /**
     * Format court: CODE/ETAGE/ESPACE (ex: "CITE-U/2/C201")
     */
    public formatCourt(): string {
        let result = this._batimentCode;
        if (this.hasEtage()) {
            result += `/${this._etageNumero}`;
            if (this.hasEspace() && this._espaceNumero) {
                result += `/${this._espaceNumero}`;
            }
        }
        return result;
    }

    /**
     * Format complet: "Batiment X, Etage Y, Espace Z"
     */
    public formatComplet(): string {
        let result = this._batimentNom;
        if (this.hasEtage()) {
            result += `, ${this._etageDesignation}`;
            if (this.hasEspace() && this._espaceNumero) {
                result += `, ${this._espaceNumero}`;
            }
        }
        return result;
    }

    /**
     * Format arborescence: "Batiment > Etage > Espace"
     */
    public formatArborescence(): string {
        let result = this._batimentNom;
        if (this.hasEtage()) {
            result += ` > ${this._etageDesignation}`;
            if (this.hasEspace() && this._espaceNumero) {
                result += ` > ${this._espaceNumero}`;
            }
        }
        return result;
    }

    /**
     * Verifie l'egalite de valeur
     */
    public equals(autre: Localisation): boolean {
        if (!autre) return false;
        return (
            this._batimentId === autre.batimentId &&
            this._etageId === autre.etageId &&
            this._espaceId === autre.espaceId
        );
    }

    /**
     * Verifie si cette localisation contient une autre (hierarchie)
     */
    public contient(autre: Localisation): boolean {
        // Meme batiment requis
        if (this._batimentId !== autre.batimentId) {
            return false;
        }
        // Si pas d'etage defini ici, on contient tout le batiment
        if (!this.hasEtage()) {
            return true;
        }
        // Meme etage requis
        if (this._etageId !== autre.etageId) {
            return false;
        }
        // Si pas d'espace defini ici, on contient tout l'etage
        if (!this.hasEspace()) {
            return true;
        }
        // Meme espace
        return this._espaceId === autre.espaceId;
    }

    /**
     * Convertit en objet JSON
     */
    public toJson(): Record<string, unknown> {
        return {
            batimentId: this._batimentId,
            batimentNom: this._batimentNom,
            batimentCode: this._batimentCode,
            etageId: this._etageId,
            etageNumero: this._etageNumero,
            etageDesignation: this._etageDesignation,
            espaceId: this._espaceId,
            espaceNumero: this._espaceNumero,
            espaceType: this._espaceType,
            formatCourt: this.formatCourt(),
            formatComplet: this.formatComplet(),
        };
    }

    public toString(): string {
        return this.formatComplet();
    }
}