// src/application/strategies/equipement-import.strategy.ts

import { Injectable, Inject } from '@nestjs/common';
import { BaseImportStrategy } from './base-import.strategy';
import {
    ValidationResult,
    ImportLineResult,
    RawExcelRow,
    ImportResult,
} from './import-strategy.interface';
import { Equipement } from '../../domain/entities';
import { TypeEquipement } from '../../domain/enums';
import {
    IEquipementRepository,
    EQUIPEMENT_REPOSITORY,
} from '../../domain/repositories';
import {
    IEspaceRepository,
    ESPACE_REPOSITORY,
} from '../../domain/repositories';
import {
    IBatimentRepository,
    BATIMENT_REPOSITORY,
} from '../../domain/repositories';
import {
    IEtageRepository,
    ETAGE_REPOSITORY,
} from '../../domain/repositories';
import { EquipementFactory } from '../factories';

/**
 * Strategy d'import pour les equipements depuis Excel
 * Supporte l'assignation directe a un espace via codeBatiment/numeroEtage/numeroEspace
 */
@Injectable()
export class EquipementImportStrategy extends BaseImportStrategy<Equipement> {
    readonly strategyName = 'EquipementImport';

    readonly requiredColumns = ['type'];

    readonly optionalColumns = [
        'marque',
        'modele',
        'numeroSerie',
        'codeBatiment',
        'numeroEtage',
        'numeroEspace',
        'dateAcquisition',
        'valeurAchat',
        'description',
    ];

    // Cache pour eviter les requetes repetees
    private espaceCache: Map<string, string> = new Map();

    constructor(
        @Inject(EQUIPEMENT_REPOSITORY)
        private readonly equipementRepository: IEquipementRepository,
        @Inject(ESPACE_REPOSITORY)
        private readonly espaceRepository: IEspaceRepository,
        @Inject(BATIMENT_REPOSITORY)
        private readonly batimentRepository: IBatimentRepository,
        @Inject(ETAGE_REPOSITORY)
        private readonly etageRepository: IEtageRepository,
        private readonly equipementFactory: EquipementFactory,
    ) {
        super();
    }

    /**
     * Reinitialise le cache
     */
    public resetCache(): void {
        this.espaceCache.clear();
    }

    /**
     * Valide une ligne d'equipement
     */
    public validateRow(row: RawExcelRow, lineNumber: number): ValidationResult {
        const baseValidation = super.validateRow(row, lineNumber);
        const errors = [...baseValidation.errors];
        const warnings: string[] = [];

        // Validation du type
        const type = this.cleanString(row['type']);
        if (type && !Object.values(TypeEquipement).includes(type as TypeEquipement)) {
            errors.push(
                `Type d'equipement invalide: ${type}. ` +
                `Valeurs acceptees: ${Object.values(TypeEquipement).join(', ')}`,
            );
        }

        // Validation de la valeur d'achat
        const valeurAchat = this.parseNumber(row['valeurAchat']);
        if (valeurAchat !== null && valeurAchat < 0) {
            errors.push('La valeur d\'achat ne peut pas etre negative');
        }

        // Validation coherence localisation (si un champ est fourni, tous doivent l'etre)
        const codeBatiment = this.cleanString(row['codeBatiment']);
        const numeroEtage = this.parseInt(row['numeroEtage']);
        const numeroEspace = this.cleanString(row['numeroEspace']);

        const hasAnyLocation = codeBatiment || numeroEtage !== null || numeroEspace;
        const hasAllLocation = codeBatiment && numeroEtage !== null && numeroEspace;

        if (hasAnyLocation && !hasAllLocation) {
            errors.push(
                'Pour assigner a un espace, fournir: codeBatiment, numeroEtage ET numeroEspace',
            );
        }

        // Validation du numero de serie (unicite verifiee a l'import)
        const numeroSerie = this.cleanString(row['numeroSerie']);
        if (numeroSerie && numeroSerie.length < 3) {
            warnings.push('Le numero de serie semble court (moins de 3 caracteres)');
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
        };
    }

    /**
     * Transforme une ligne Excel en entite Equipement
     */
    public transformRow(row: RawExcelRow): Equipement {
        return this.equipementFactory.create({
            type: this.cleanString(row['type']) as TypeEquipement,
            marque: this.cleanString(row['marque']) ?? undefined,
            modele: this.cleanString(row['modele']) ?? undefined,
            numeroSerie: this.cleanString(row['numeroSerie']) ?? undefined,
            dateAcquisition: this.parseDate(row['dateAcquisition'])
                ? this.parseDate(row['dateAcquisition'])!.toISOString()
                : undefined,
            valeurAchat: this.parseNumber(row['valeurAchat']) ?? undefined,
            description: this.cleanString(row['description']) ?? undefined,
        });
    }

    /**
     * Importe un equipement (sans espace)
     */
    public async importEntity(entity: Equipement): Promise<ImportLineResult> {
        try {
            // Verifier unicite numero de serie si fourni
            if (entity.numeroSerie) {
                const exists = await this.equipementRepository.numeroSerieExists(
                    entity.numeroSerie,
                );
                if (exists) {
                    return {
                        lineNumber: 0,
                        success: false,
                        errors: [
                            `Un equipement avec le numero de serie "${entity.numeroSerie}" existe deja`,
                        ],
                        warnings: [],
                    };
                }
            }

            const saved = await this.equipementRepository.save(entity);

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

    /**
     * Resout l'ID d'un espace depuis les references
     */
    private async resolveEspaceId(
        codeBatiment: string,
        numeroEtage: number,
        numeroEspace: string,
    ): Promise<string | null> {
        const cacheKey = `${codeBatiment}-${numeroEtage}-${numeroEspace}`;
        
        if (this.espaceCache.has(cacheKey)) {
            return this.espaceCache.get(cacheKey)!;
        }

        // Trouver le batiment
        const batiment = await this.batimentRepository.findByCode(codeBatiment);
        if (!batiment) {
            return null;
        }

        // Trouver l'etage
        const etage = await this.etageRepository.findByBatimentAndNumero(
            batiment.id,
            numeroEtage,
        );
        if (!etage) {
            return null;
        }

        // Trouver l'espace
        const espace = await this.espaceRepository.findByEtageAndNumero(
            etage.id,
            numeroEspace,
        );
        if (!espace) {
            return null;
        }

        this.espaceCache.set(cacheKey, espace.id);
        return espace.id;
    }

    /**
     * Override du processFile pour gerer l'assignation aux espaces
     */
    public async processFile(rows: RawExcelRow[]): Promise<ImportResult> {
        const startTime = Date.now();
        const results: ImportLineResult[] = [];
        let successCount = 0;
        let errorCount = 0;
        let warningCount = 0;

        this.resetCache();

        for (let i = 0; i < rows.length; i++) {
            const lineNumber = i + 2;
            const row = rows[i];

            // Validation
            const validation = this.validateRow(row, lineNumber);

            if (!validation.isValid) {
                results.push({
                    lineNumber,
                    success: false,
                    errors: validation.errors,
                    warnings: validation.warnings,
                });
                errorCount++;
                continue;
            }

            // Transformation
            let equipement: Equipement;
            try {
                equipement = this.transformRow(row);
            } catch (error) {
                results.push({
                    lineNumber,
                    success: false,
                    errors: [`Erreur de transformation: ${(error as Error).message}`],
                    warnings: [],
                });
                errorCount++;
                continue;
            }

            // Resolution de l'espace si fourni
            const codeBatiment = this.cleanString(row['codeBatiment']);
            const numeroEtage = this.parseInt(row['numeroEtage']);
            const numeroEspace = this.cleanString(row['numeroEspace']);

            if (codeBatiment && numeroEtage !== null && numeroEspace) {
                const espaceId = await this.resolveEspaceId(
                    codeBatiment,
                    numeroEtage,
                    numeroEspace,
                );

                if (!espaceId) {
                    results.push({
                        lineNumber,
                        success: false,
                        errors: [
                            `Espace non trouve: ${codeBatiment}/${numeroEtage}/${numeroEspace}`,
                        ],
                        warnings: validation.warnings,
                    });
                    errorCount++;
                    continue;
                }

                // Assigner l'equipement a l'espace
                equipement.assignerAEspace(espaceId);
            }

            // Import
            const importResult = await this.importEntity(equipement);
            importResult.lineNumber = lineNumber;
            importResult.warnings = validation.warnings;

            if (importResult.warnings.length > 0) {
                warningCount++;
            }

            if (importResult.success) {
                successCount++;
            } else {
                errorCount++;
            }

            results.push(importResult);
        }

        return {
            success: errorCount === 0,
            totalLines: rows.length,
            successCount,
            errorCount,
            warningCount,
            lines: results,
            duration: Date.now() - startTime,
        };
    }
}