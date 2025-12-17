// src/application/strategies/espace-import.strategy.ts

import { Injectable, Inject } from '@nestjs/common';
import { BaseImportStrategy } from './base-import.strategy';
import {
    ValidationResult,
    ImportLineResult,
    RawExcelRow,
} from './import-strategy.interface';
import { Espace } from '../../domain/entities';
import { TypeEspace } from '../../domain/enums';
import { IEspaceRepository, ESPACE_REPOSITORY } from '../../domain/repositories';
import { IEtageRepository, ETAGE_REPOSITORY } from '../../domain/repositories';
import { IBatimentRepository, BATIMENT_REPOSITORY } from '../../domain/repositories';
import { EspaceFactory } from '../factories';

/**
 * Strategy d'import pour les espaces depuis Excel
 * Supporte la reference par code batiment + numero etage
 */
@Injectable()
export class EspaceImportStrategy extends BaseImportStrategy<Espace> {
    readonly strategyName = 'EspaceImport';
    
    readonly requiredColumns = ['numero', 'type', 'codeBatiment', 'numeroEtage'];
    
    readonly optionalColumns = [
        'superficie',
        'capacite',
        'description',
    ];

    // Cache pour eviter les requetes repetees
    private batimentCache: Map<string, string> = new Map();
    private etageCache: Map<string, string> = new Map();

    constructor(
        @Inject(ESPACE_REPOSITORY)
        private readonly espaceRepository: IEspaceRepository,
        @Inject(ETAGE_REPOSITORY)
        private readonly etageRepository: IEtageRepository,
        @Inject(BATIMENT_REPOSITORY)
        private readonly batimentRepository: IBatimentRepository,
        private readonly espaceFactory: EspaceFactory,
    ) {
        super();
    }

    /**
     * Reinitialise les caches avant un import
     */
    public resetCache(): void {
        this.batimentCache.clear();
        this.etageCache.clear();
    }

    /**
     * Valide une ligne d'espace
     */
    public validateRow(row: RawExcelRow, lineNumber: number): ValidationResult {
        const baseValidation = super.validateRow(row, lineNumber);
        const errors = [...baseValidation.errors];
        const warnings: string[] = [];

        // Validation du type
        const type = this.cleanString(row['type']);
        if (type && !Object.values(TypeEspace).includes(type as TypeEspace)) {
            errors.push(
                `Type d'espace invalide: ${type}. ` +
                `Valeurs acceptees: ${Object.values(TypeEspace).join(', ')}`,
            );
        }

        // Validation du numero d'etage
        const numeroEtage = this.parseInt(row['numeroEtage']);
        if (numeroEtage === null) {
            errors.push('Le numero d\'etage doit etre un entier');
        }

        // Validation de la capacite
        const capacite = this.parseInt(row['capacite']);
        if (capacite !== null && capacite < 1) {
            errors.push('La capacite doit etre au moins 1');
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
     * Transforme une ligne Excel en entite Espace
     * Note: etageId sera resolu lors de l'import
     */
    public transformRow(row: RawExcelRow): Espace {
        // L'etageId sera defini dans importEntity apres resolution
        return this.espaceFactory.create({
            etageId: '', // Placeholder, sera resolu
            numero: this.cleanString(row['numero'])!,
            type: this.cleanString(row['type']) as TypeEspace,
            superficie: this.parseNumber(row['superficie']) ?? undefined,
            capacite: this.parseInt(row['capacite']) ?? undefined,
            description: this.cleanString(row['description']) ?? undefined,
        });
    }

    /**
     * Importe un espace avec resolution des references
     */
    public async importEntity(entity: Espace): Promise<ImportLineResult> {
        // Cette methode ne sera pas utilisee directement
        // L'import passe par importEntityWithContext
        return {
            lineNumber: 0,
            success: false,
            errors: ['Utilisez importEntityWithContext pour les espaces'],
            warnings: [],
        };
    }

    /**
     * Importe un espace avec le contexte de la ligne Excel
     */
    public async importEntityWithContext(
        row: RawExcelRow,
    ): Promise<ImportLineResult> {
        try {
            const codeBatiment = this.cleanString(row['codeBatiment'])!;
            const numeroEtage = this.parseInt(row['numeroEtage'])!;

            // Resoudre le batiment
            let batimentId = this.batimentCache.get(codeBatiment);
            if (!batimentId) {
                const batiment = await this.batimentRepository.findByCode(codeBatiment);
                if (!batiment) {
                    return {
                        lineNumber: 0,
                        success: false,
                        errors: [`Batiment non trouve avec le code: ${codeBatiment}`],
                        warnings: [],
                    };
                }
                batimentId = batiment.id;
                this.batimentCache.set(codeBatiment, batimentId);
            }

            // Resoudre l'etage
            const cacheKey = `${batimentId}-${numeroEtage}`;
            let etageId = this.etageCache.get(cacheKey);
            if (!etageId) {
                const etage = await this.etageRepository.findByBatimentAndNumero(
                    batimentId,
                    numeroEtage,
                );
                if (!etage) {
                    return {
                        lineNumber: 0,
                        success: false,
                        errors: [
                            `Etage ${numeroEtage} non trouve dans le batiment ${codeBatiment}`,
                        ],
                        warnings: [],
                    };
                }
                etageId = etage.id;
                this.etageCache.set(cacheKey, etageId);
            }

            // Creer l'espace avec le bon etageId
            const espace = this.espaceFactory.create({
                etageId,
                numero: this.cleanString(row['numero'])!,
                type: this.cleanString(row['type']) as TypeEspace,
                superficie: this.parseNumber(row['superficie']) ?? undefined,
                capacite: this.parseInt(row['capacite']) ?? undefined,
                description: this.cleanString(row['description']) ?? undefined,
            });

            // Verifier l'unicite du numero dans l'etage
            const exists = await this.espaceRepository.numeroExists(etageId, espace.numero);
            if (exists) {
                return {
                    lineNumber: 0,
                    success: false,
                    errors: [
                        `Un espace avec le numero "${espace.numero}" existe deja ` +
                        `dans l'etage ${numeroEtage} du batiment ${codeBatiment}`,
                    ],
                    warnings: [],
                };
            }

            // Sauvegarder
            const saved = await this.espaceRepository.save(espace);

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
     * Override du processFile pour utiliser importEntityWithContext
     */
    public async processFile(rows: RawExcelRow[]): Promise<import('./import-strategy.interface').ImportResult> {
        const startTime = Date.now();
        const results: ImportLineResult[] = [];
        let successCount = 0;
        let errorCount = 0;
        let warningCount = 0;

        // Reset cache avant l'import
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

            // Import avec contexte
            const importResult = await this.importEntityWithContext(row);
            importResult.lineNumber = lineNumber;
            importResult.warnings = [...(importResult.warnings || []), ...validation.warnings];
            
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