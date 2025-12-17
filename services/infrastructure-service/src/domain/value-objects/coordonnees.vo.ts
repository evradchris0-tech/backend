// src/domain/value-objects/coordonnees.vo.ts

/**
 * Value Object representant des coordonnees GPS
 * Immutable - toute modification cree une nouvelle instance
 */
export class Coordonnees {
    private constructor(
        private readonly _latitude: number,
        private readonly _longitude: number,
        private readonly _altitude?: number,
    ) {
        this.validateCoordinates();
    }

    /**
     * Factory method pour creer des coordonnees valides
     */
    public static create(
        latitude: number,
        longitude: number,
        altitude?: number,
    ): Coordonnees {
        return new Coordonnees(latitude, longitude, altitude);
    }

    /**
     * Cree des coordonnees depuis un objet JSON
     */
    public static fromJson(json: {
        latitude: number;
        longitude: number;
        altitude?: number;
    }): Coordonnees {
        return new Coordonnees(json.latitude, json.longitude, json.altitude);
    }

    /**
     * Retourne une representation null-safe
     */
    public static empty(): Coordonnees | null {
        return null;
    }

    get latitude(): number {
        return this._latitude;
    }

    get longitude(): number {
        return this._longitude;
    }

    get altitude(): number | undefined {
        return this._altitude;
    }

    /**
     * Valide les coordonnees GPS
     */
    private validateCoordinates(): void {
        if (this._latitude < -90 || this._latitude > 90) {
            throw new Error(
                `Latitude invalide: ${this._latitude}. Doit etre entre -90 et 90.`,
            );
        }
        if (this._longitude < -180 || this._longitude > 180) {
            throw new Error(
                `Longitude invalide: ${this._longitude}. Doit etre entre -180 et 180.`,
            );
        }
        if (this._altitude !== undefined && this._altitude < -500) {
            throw new Error(
                `Altitude invalide: ${this._altitude}. Ne peut pas etre inferieure a -500m.`,
            );
        }
    }

    /**
     * Calcule la distance en metres vers d'autres coordonnees
     * Utilise la formule de Haversine
     */
    public distanceVers(autres: Coordonnees): number {
        const R = 6371000; // Rayon de la Terre en metres
        const lat1Rad = this.degreesToRadians(this._latitude);
        const lat2Rad = this.degreesToRadians(autres.latitude);
        const deltaLat = this.degreesToRadians(autres.latitude - this._latitude);
        const deltaLon = this.degreesToRadians(autres.longitude - this._longitude);

        const a =
            Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.cos(lat1Rad) *
                Math.cos(lat2Rad) *
                Math.sin(deltaLon / 2) *
                Math.sin(deltaLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }

    private degreesToRadians(degrees: number): number {
        return degrees * (Math.PI / 180);
    }

    /**
     * Verifie l'egalite de valeur avec d'autres coordonnees
     */
    public equals(autres: Coordonnees): boolean {
        if (!autres) return false;
        return (
            this._latitude === autres.latitude &&
            this._longitude === autres.longitude &&
            this._altitude === autres.altitude
        );
    }

    /**
     * Retourne une copie avec une nouvelle altitude
     */
    public avecAltitude(altitude: number): Coordonnees {
        return new Coordonnees(this._latitude, this._longitude, altitude);
    }

    /**
     * Convertit en objet JSON pour serialisation
     */
    public toJson(): { latitude: number; longitude: number; altitude?: number } {
        return {
            latitude: this._latitude,
            longitude: this._longitude,
            ...(this._altitude !== undefined && { altitude: this._altitude }),
        };
    }

    /**
     * Representation textuelle pour affichage
     */
    public toString(): string {
        const alt = this._altitude !== undefined ? `, ${this._altitude}m` : '';
        return `(${this._latitude.toFixed(6)}, ${this._longitude.toFixed(6)}${alt})`;
    }

    /**
     * Format Google Maps URL
     */
    public toGoogleMapsUrl(): string {
        return `https://www.google.com/maps?q=${this._latitude},${this._longitude}`;
    }
}