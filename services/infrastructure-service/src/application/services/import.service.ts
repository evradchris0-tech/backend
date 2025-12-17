// src/application/services/import.service.ts

import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
    IBatimentRepository,
    BATIMENT_REPOSITORY,
    IEtageRepository,
    ETAGE_REPOSITORY,
    IEspaceRepository,
    ESPACE_REPOSITORY,
    IEquipementRepository,
    EQUIPEMENT_REPOSITORY,
} from '../../domain/repositories';
import {
    ImportStrategy,
    ImportResult,
    RawExcelRow,
} from '../strategies/import-strategy.interface';
import { BatimentImportStrategy } from '../strategies/batiment-import.strategy';
import { EspaceImportStrategy } from '../strategies/espace-import.strategy';
import { EquipementImportStrategy } from '../strategies/equipement-import.strategy';
import { Batiment, Espace, Equipement } from '../../domain/entities';

/**
 * Types d'import disponibles
 */
export enum TypeImport {
    BATIMENTS = 'BATIMENTS',
    ESPACES = 'ESPACES',
    EQUIPEMENTS = 'EQUIPEMENTS',
}

/**
 * Options d'import
 */
export interface ImportOptions {
    type: TypeImport;
    continuerSurErreur?: boolean;
    modeSimulation?: boolean;
}

/**
 * Resultat detaille d'un import
 */
export interface ImportServiceResult {
    type: TypeImport;
    success: boolean;
    totalLines: number;
    successCount: number;
    errorCount: number;
    warningCount: number;
    duration: number;
    timestamp: Date;
}

/**
 * Service d'orchestration des imports Excel
 * Delegue aux strategies specifiques selon le type d'import
 */
@Injectable()
export class ImportService {
    private strategies: Map<TypeImport, ImportStrategy<any>>;

    constructor(
        @Inject(BATIMENT_REPOSITORY)
        private readonly batimentRepository: IBatimentRepository,
        @Inject(ETAGE_REPOSITORY)
        private readonly etageRepository: IEtageRepository,
        @Inject(ESPACE_REPOSITORY)
        private readonly espaceRepository: IEspaceRepository,
        @Inject(EQUIPEMENT_REPOSITORY)
        private readonly equipementRepository: IEquipementRepository,
        private readonly eventEmitter: EventEmitter2,
    ) {
        // Initialiser les strategies
        this.strategies = new Map();
        this.initializeStrategies();
    }

    /**
     * Initialise les strategies d'import
     * Note: Les strategies sont injectees via le module NestJS
     * Cette methode est gardee pour compatibilite mais les strategies
     * devraient etre injectees dans le constructeur
     */
    private initializeStrategies(): void {
        // Les strategies seront injectees via NestJS DI
        // Pas d'initialisation manuelle necessaire
    }

    /**
     * Enregistre une strategie d'import
     */
    public registerStrategy(type: TypeImport, strategy: ImportStrategy<any>): void {
        this.strategies.set(type, strategy);
    }

    /**
     * Importe des donnees depuis un fichier Excel
     */
    async importFromExcel(
        fileBuffer: Buffer,
        options: ImportOptions,
    ): Promise<ImportServiceResult> {
        const startTime = Date.now();

        // Verifier que le type d'import est supporte
        const strategy = this.strategies.get(options.type);
        if (!strategy) {
            throw new BadRequestException(
                `Type d'import '${options.type}' non supporte`,
            );
        }

        // Parser le fichier Excel
        const rows = await this.parseExcelFile(fileBuffer);

        if (rows.length === 0) {
            throw new BadRequestException('Le fichier Excel est vide');
        }

        // Emettre l'evenement de debut d'import
        this.eventEmitter.emit('import.started', {
            type: options.type,
            nombreLignes: rows.length,
        });

        // Executer l'import via la strategie appropriee
        const result = await strategy.processFile(rows);

        const duration = Date.now() - startTime;

        // Emettre l'evenement de fin d'import
        this.eventEmitter.emit('import.completed', {
            type: options.type,
            success: result.success,
            totalLines: result.totalLines,
            successCount: result.successCount,
            errorCount: result.errorCount,
            duration,
        });

        return {
            type: options.type,
            success: result.success,
            totalLines: result.totalLines,
            successCount: options.modeSimulation ? 0 : result.successCount,
            errorCount: result.errorCount,
            warningCount: result.warningCount,
            duration,
            timestamp: new Date(),
        };
    }

    /**
     * Valide un fichier Excel sans importer les donnees
     */
    async validateExcel(
        fileBuffer: Buffer,
        type: TypeImport,
    ): Promise<ImportResult> {
        const strategy = this.strategies.get(type);
        if (!strategy) {
            throw new BadRequestException(
                `Type d'import '${type}' non supporte`,
            );
        }

        const rows = await this.parseExcelFile(fileBuffer);

        if (rows.length === 0) {
            return {
                success: false,
                totalLines: 0,
                successCount: 0,
                errorCount: 0,
                warningCount: 0,
                lines: [],
                duration: 0,
            };
        }

        // Valider sans importer
        const lines: import('../strategies/import-strategy.interface').ImportLineResult[] = [];
        let successCount = 0;
        let errorCount = 0;
        let warningCount = 0;

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const validation = strategy.validateRow(row, i + 2); // +2 pour header et index 0

            if (!validation.isValid) {
                errorCount++;
                lines.push({
                    lineNumber: i + 2,
                    success: false,
                    errors: validation.errors,
                    warnings: validation.warnings,
                });
            } else {
                successCount++;
                if (validation.warnings.length > 0) {
                    warningCount++;
                }
                lines.push({
                    lineNumber: i + 2,
                    success: true,
                    errors: [],
                    warnings: validation.warnings,
                });
            }
        }

        return {
            success: errorCount === 0,
            totalLines: rows.length,
            successCount,
            errorCount,
            warningCount,
            lines,
            duration: 0,
        };
    }

    /**
     * Recupere le template Excel pour un type d'import
     */
    getTemplateColumns(type: TypeImport): { required: string[]; optional: string[] } {
        switch (type) {
            case TypeImport.BATIMENTS:
                return {
                    required: ['nom', 'code', 'type'],
                    optional: [
                        'adresse',
                        'latitude',
                        'longitude',
                        'altitude',
                        'nombreEtages',
                        'superficie',
                        'dateConstruction',
                        'description',
                    ],
                };
            case TypeImport.ESPACES:
                return {
                    required: ['numero', 'type', 'codeBatiment', 'numeroEtage'],
                    optional: ['superficie', 'capacite', 'description'],
                };
            case TypeImport.EQUIPEMENTS:
                return {
                    required: ['type'],
                    optional: [
                        'marque',
                        'modele',
                        'numeroSerie',
                        'codeBatiment',
                        'numeroEtage',
                        'numeroEspace',
                        'dateAcquisition',
                        'valeurAchat',
                        'description',
                    ],
                };
            default:
                throw new BadRequestException(`Type d'import '${type}' non supporte`);
        }
    }

    /**
     * Recupere les valeurs valides pour les colonnes enum
     */
    getEnumValues(type: TypeImport): Record<string, string[]> {
        const { TypeBatiment, TypeEspace, TypeEquipement } = require('../../domain/enums');

        switch (type) {
            case TypeImport.BATIMENTS:
                return {
                    type: Object.values(TypeBatiment),
                };
            case TypeImport.ESPACES:
                return {
                    type: Object.values(TypeEspace),
                };
            case TypeImport.EQUIPEMENTS:
                return {
                    type: Object.values(TypeEquipement),
                };
            default:
                return {};
        }
    }

    /**
     * Parse un fichier Excel en tableau d'objets
     */
    private async parseExcelFile(
        fileBuffer: Buffer,
    ): Promise<Record<string, any>[]> {
        // Import dynamique de xlsx pour eviter les problemes de chargement
        const XLSX = await import('xlsx');

        // Lire le workbook
        const workbook = XLSX.read(fileBuffer, { type: 'buffer' });

        // Prendre la premiere feuille
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
            throw new BadRequestException('Le fichier Excel ne contient aucune feuille');
        }

        const worksheet = workbook.Sheets[sheetName];

        // Convertir en JSON
        const rows = XLSX.utils.sheet_to_json(worksheet, {
            raw: false, // Convertir les dates en strings
            defval: '', // Valeur par defaut pour les cellules vides
        });

        return rows as RawExcelRow[];
    }

    /**
     * Genere un fichier Excel template
     */
    async generateTemplate(type: TypeImport): Promise<Buffer> {
        const XLSX = await import('xlsx');

        const { required, optional } = this.getTemplateColumns(type);
        const enumValues = this.getEnumValues(type);

        // Creer les headers
        const headers = [...required, ...optional];

        // Creer une ligne d'exemple
        const exampleRow: Record<string, string> = {};
        for (const col of headers) {
            if (enumValues[col]) {
                exampleRow[col] = enumValues[col][0]; // Premier valeur de l'enum
            } else if (col.includes('date')) {
                exampleRow[col] = '2024-01-15';
            } else if (col.includes('superficie') || col.includes('capacite') || col.includes('valeur')) {
                exampleRow[col] = '100';
            } else if (col.includes('latitude')) {
                exampleRow[col] = '4.0511';
            } else if (col.includes('longitude')) {
                exampleRow[col] = '9.7679';
            } else if (col.includes('altitude')) {
                exampleRow[col] = '50';
            } else if (col.includes('etage')) {
                exampleRow[col] = '1';
            } else {
                exampleRow[col] = `Exemple ${col}`;
            }
        }

        // Creer le workbook
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet([exampleRow], { header: headers });

        // Ajouter une feuille avec les valeurs d'enum autorisees
        const enumSheet: Record<string, string>[] = [];
        for (const [col, values] of Object.entries(enumValues)) {
            for (const value of values) {
                enumSheet.push({ colonne: col, valeur_autorisee: value });
            }
        }

        XLSX.utils.book_append_sheet(workbook, worksheet, 'Donnees');
        if (enumSheet.length > 0) {
            const enumWorksheet = XLSX.utils.json_to_sheet(enumSheet);
            XLSX.utils.book_append_sheet(workbook, enumWorksheet, 'Valeurs_autorisees');
        }

        // Generer le buffer
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        return buffer;
    }
}