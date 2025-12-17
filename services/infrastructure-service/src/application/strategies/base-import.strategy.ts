// src/application/strategies/base-import.strategy.ts

import {
    ImportStrategy,
    ValidationResult,
    ImportLineResult,
    ImportResult,
    RawExcelRow,
} from './import-strategy.interface';

/**
 * Classe abstraite de base pour les strategies d'import
 * Implemente la logique commune et definit le template method
 */
export abstract class BaseImportStrategy<T> implements ImportStrategy<T> {
    abstract readonly strategyName: string;
    abstract readonly requiredColumns: string[];
    abstract readonly optionalColumns: string[];

    /**
     * Valide les colonnes requises
     */
    protected validateRequiredColumns(row: RawExcelRow): string[] {
        const errors: string[] = [];
        
        for (const column of this.requiredColumns) {
            const value = row[column];
            if (value === undefined || value === null || value === '') {
                errors.push(`Colonne obligatoire manquante ou vide: ${column}`);
            }
        }
        
        return errors;
    }

    /**
     * Nettoie une valeur string
     */
    protected cleanString(value: unknown): string | null {
        if (value === undefined || value === null) {
            return null;
        }
        const str = String(value).trim();
        return str === '' ? null : str;
    }

    /**
     * Parse un nombre
     */
    protected parseNumber(value: unknown): number | null {
        if (value === undefined || value === null || value === '') {
            return null;
        }
        const num = Number(value);
        return isNaN(num) ? null : num;
    }

    /**
     * Parse un entier
     */
    protected parseInt(value: unknown): number | null {
        const num = this.parseNumber(value);
        return num !== null ? Math.floor(num) : null;
    }

    /**
     * Parse une date
     */
    protected parseDate(value: unknown): Date | null {
        if (value === undefined || value === null || value === '') {
            return null;
        }
        
        // Si c'est deja une date Excel (nombre)
        if (typeof value === 'number') {
            // Conversion date Excel vers JavaScript
            const excelEpoch = new Date(1899, 11, 30);
            const date = new Date(excelEpoch.getTime() + value * 86400000);
            return isNaN(date.getTime()) ? null : date;
        }
        
        // Si c'est une chaine
        const date = new Date(String(value));
        return isNaN(date.getTime()) ? null : date;
    }

    /**
     * Parse un booleen
     */
    protected parseBoolean(value: unknown): boolean {
        if (value === undefined || value === null) {
            return false;
        }
        if (typeof value === 'boolean') {
            return value;
        }
        const str = String(value).toLowerCase().trim();
        return ['true', 'oui', 'yes', '1', 'vrai'].includes(str);
    }

    /**
     * Validation de base - a surcharger dans les sous-classes
     */
    public validateRow(row: RawExcelRow, lineNumber: number): ValidationResult {
        const errors = this.validateRequiredColumns(row);
        return {
            isValid: errors.length === 0,
            errors,
            warnings: [],
        };
    }

    /**
     * Transformation - a implementer dans les sous-classes
     */
    public abstract transformRow(row: RawExcelRow): T;

    /**
     * Import d'une entite - a implementer dans les sous-classes
     */
    public abstract importEntity(entity: T): Promise<ImportLineResult>;

    /**
     * Template Method: traitement complet d'un fichier
     */
    public async processFile(rows: RawExcelRow[]): Promise<ImportResult> {
        const startTime = Date.now();
        const results: ImportLineResult[] = [];
        let successCount = 0;
        let errorCount = 0;
        let warningCount = 0;

        for (let i = 0; i < rows.length; i++) {
            const lineNumber = i + 2; // +2 car ligne 1 = headers, index 0 = ligne 2
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
            let entity: T;
            try {
                entity = this.transformRow(row);
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

            // Import
            const importResult = await this.importEntity(entity);
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