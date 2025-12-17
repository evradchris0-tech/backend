// src/application/strategies/batiment-import.strategy.ts

import { Injectable, Inject } from '@nestjs/common';
import { BaseImportStrategy } from './base-import.strategy';
import {
    ValidationResult,
    ImportLineResult,
    RawExcelRow,
} from './import-strategy.interface';
import { Batiment } from '../../domain/entities';
import { TypeBatiment } from '../../domain/enums';
import { IBatimentRepository, BATIMENT_REPOSITORY } from '../../domain/repositories';
import { BatimentFactory } from '../factories';

/**
 * Strategy d'import pour les batiments depuis Excel
 */
@Injectable()
export class BatimentImportStrategy extends BaseImportStrategy<Batiment> {
    readonly strategyName = 'BatimentImport';
    
    readonly requiredColumns = ['nom', 'code', 'type'];
    
    readonly optionalColumns = [
        'adresse',
        'latitude',
        'longitude',
        'altitude',
        'nombreEtages',
        'superficie',
        'dateConstruction',
        'description',
    ];

    constructor(
        @Inject(BATIMENT_REPOSITORY)
        private readonly batimentRepository: IBatimentRepository,
        private readonly batimentFactory: BatimentFactory,
    ) {
        super();
    }

    /**
     * Valide une ligne de batiment
     */
    public validateRow(row: RawExcelRow, lineNumber: number): ValidationResult {
        const baseValidation = super.validateRow(row, lineNumber);
        const errors = [...baseValidation.errors];
        const warnings: string[] = [];

        // Validation du type
        const type = this.cleanString(row['type']);
        if (type && !Object.values(TypeBatiment).includes(type as TypeBatiment)) {
            errors.push(
                `Type de batiment invalide: ${type}. ` +
                `Valeurs acceptees: ${Object.values(TypeBatiment).join(', ')}`,
            );
        }

        // Validation du code (format)
        const code = this.cleanString(row['code']);
        if (code && code.length < 2) {
            errors.push('Le code doit contenir au moins 2 caracteres');
        }
        if (code && !/^[A-Z0-9-]+$/i.test(code)) {
            warnings.push('Le code contient des caracteres speciaux (sera normalise)');
        }

        // Validation des coordonnees
        const latitude = this.parseNumber(row['latitude']);
        const longitude = this.parseNumber(row['longitude']);
        
        if (latitude !== null && (latitude < -90 || latitude > 90)) {
            errors.push('Latitude invalide (doit etre entre -90 et 90)');
        }
        if (longitude !== null && (longitude < -180 || longitude > 180)) {
            errors.push('Longitude invalide (doit etre entre -180 et 180)');
        }
        if ((latitude !== null && longitude === null) || (latitude === null && longitude !== null)) {
            warnings.push('Latitude et longitude doivent etre fournies ensemble');
        }

        // Validation du nombre d'etages
        const nombreEtages = this.parseInt(row['nombreEtages']);
        if (nombreEtages !== null && nombreEtages < 1) {
            errors.push('Le nombre d\'etages doit etre au moins 1');
        }

        // Validation de la superficie
        const superficie = this.parseNumber(row['superficie']);
        if (superficie !== null && superficie <= 0) {
            errors.push('La superficie doit etre positive');
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
        };
    }

    /**
     * Transforme une ligne Excel en entite Batiment
     */
    public transformRow(row: RawExcelRow): Batiment {
        const latitude = this.parseNumber(row['latitude']);
        const longitude = this.parseNumber(row['longitude']);
        const altitude = this.parseNumber(row['altitude']);

        return this.batimentFactory.create({
            nom: this.cleanString(row['nom'])!,
            code: this.cleanString(row['code'])!.toUpperCase().replace(/[^A-Z0-9-]/gi, ''),
            type: this.cleanString(row['type']) as TypeBatiment,
            adresse: this.cleanString(row['adresse']) ?? undefined,
            coordonnees: latitude !== null && longitude !== null
                ? { latitude, longitude, altitude: altitude ?? undefined }
                : undefined,
            nombreEtages: this.parseInt(row['nombreEtages']) ?? undefined,
            superficie: this.parseNumber(row['superficie']) ?? undefined,
            dateConstruction: this.parseDate(row['dateConstruction']) 
                ? this.parseDate(row['dateConstruction'])!.toISOString()
                : undefined,
            description: this.cleanString(row['description']) ?? undefined,
        });
    }

    /**
     * Importe un batiment dans la base de donnees
     */
    public async importEntity(entity: Batiment): Promise<ImportLineResult> {
        try {
            // Verifier si le code existe deja
            const existingByCode = await this.batimentRepository.codeExists(entity.code);
            if (existingByCode) {
                return {
                    lineNumber: 0,
                    success: false,
                    errors: [`Un batiment avec le code "${entity.code}" existe deja`],
                    warnings: [],
                };
            }

            // Sauvegarder
            const saved = await this.batimentRepository.save(entity);

            return {
                lineNumber: 0,
                success: true,
                entityId: saved.id,
                errors: [],
                warnings: [],
            };
        } catch (error) {
            return {
                lineNumber: 0,
                success: false,
                errors: [`Erreur lors de la sauvegarde: ${(error as Error).message}`],
                warnings: [],
            };
        }
    }
}