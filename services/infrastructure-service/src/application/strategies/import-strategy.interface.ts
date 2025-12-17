// src/application/strategies/import-strategy.interface.ts

/**
 * Representation d'une ligne brute Excel
 */
export type RawExcelRow = Record<string, unknown>;

/**
 * Resultat de validation d'une ligne
 */
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

/**
 * Resultat d'import d'une ligne
 */
export interface ImportLineResult {
    lineNumber: number;
    success: boolean;
    entityId?: string;
    errors: string[];
    warnings: string[];
}

/**
 * Resultat global d'un import
 */
export interface ImportResult {
    success: boolean;
    totalLines: number;
    successCount: number;
    errorCount: number;
    warningCount: number;
    lines: ImportLineResult[];
    duration: number;
}

/**
 * Interface pour les strategies d'import
 */
export interface ImportStrategy<T> {
    readonly strategyName: string;
    readonly requiredColumns: string[];
    readonly optionalColumns: string[];

    /**
     * Valide une ligne de donnees
     */
    validateRow(row: RawExcelRow, lineNumber: number): ValidationResult;

    /**
     * Transforme une ligne en entite
     */
    transformRow(row: RawExcelRow): T;

    /**
     * Importe une entite
     */
    importEntity(entity: T): Promise<ImportLineResult>;

    /**
     * Traite un fichier complet
     */
    processFile(rows: RawExcelRow[]): Promise<ImportResult>;
}
