import { IsEmail, IsString, IsOptional, IsEnum, MinLength, MaxLength } from 'class-validator';

/**
 * DTO pour l'import d'utilisateurs via Excel
 */
export class ImportUserExcelDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(3)
  fullName: string;

  @IsString()
  @MinLength(5)
  @MaxLength(255)
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  roomNumber?: string;

  @IsEnum(['OCCUPANT', 'GESTIONNAIRE', 'ADMIN'])
  @IsOptional()
  role?: string;

  /**
   * Auto-set to true for all imports
   * Aucune vérification d'email requise
   */
  isVerified?: boolean;
}

/**
 * DTO pour la validation d'un fichier Excel
 */
export class ExcelValidationDto {
  success: boolean;
  rowCount: number;
  errors: ExcelErrorDto[];
  warnings: ExcelWarningDto[];
  message: string;
}

/**
 * DTO pour une erreur dans le fichier Excel
 */
export class ExcelErrorDto {
  lineNumber: number;
  email?: string;
  error: string;
}

/**
 * DTO pour un avertissement dans le fichier Excel
 */
export class ExcelWarningDto {
  lineNumber: number;
  message: string;
}

/**
 * DTO pour le résultat de l'import
 */
export class ImportResultDto {
  success: boolean;
  imported: number;
  errors: ExcelErrorDto[];
  warnings: ExcelWarningDto[];
  message: string;
}

/**
 * DTO pour le template Excel
 * (Response: fichier Excel binaire)
 */
export class ExcelTemplateDto {
  filename: string;
  buffer: Buffer;
  mimeType: string;
}

/**
 * DTO pour l'export des utilisateurs
 * (Response: fichier Excel binaire)
 */
export class ExcelExportDto {
  filename: string;
  buffer: Buffer;
  mimeType: string;
}

/**
 * DTO interne pour la validation d'une ligne Excel
 */
export class ExcelRowValidationDto {
  isValid: boolean;
  email?: string;
  fullName?: string;
  address?: string;
  roomNumber?: string;
  role?: string;
  isVerified?: boolean;
  errors: string[];
}

/**
 * DTO pour les paramètres du fichier Excel
 */
export class ExcelFileParamsDto {
  mimetype: string;
  size: number;
  filename: string;
  buffer: Buffer;
}

/**
 * Response DTO pour l'endpoint POST /users/import/validate
 */
export class ValidateImportResponseDto {
  success: boolean;
  rowCount: number;
  errors: ExcelErrorDto[];
  warnings: ExcelWarningDto[];
  message: string;

  constructor(
    success: boolean,
    rowCount: number,
    errors: ExcelErrorDto[] = [],
    warnings: ExcelWarningDto[] = [],
  ) {
    this.success = success;
    this.rowCount = rowCount;
    this.errors = errors;
    this.warnings = warnings;
    this.message = success
      ? `✅ ${rowCount} lignes valides, prêtes à importer`
      : `❌ ${errors.length} erreurs trouvées`;
  }
}

/**
 * Response DTO pour l'endpoint POST /users/import/upload
 */
export class ImportUsersResponseDto {
  success: boolean;
  imported: number;
  errors: ExcelErrorDto[];
  warnings: ExcelWarningDto[];
  message: string;

  constructor(
    imported: number,
    errors: ExcelErrorDto[] = [],
    warnings: ExcelWarningDto[] = [],
  ) {
    this.success = imported > 0;
    this.imported = imported;
    this.errors = errors;
    this.warnings = warnings;
    this.message =
      imported > 0
        ? `✅ ${imported} utilisateurs importés avec succès (isVerified = true)`
        : '❌ Aucun utilisateur importé';
  }
}

/**
 * Mapping des colonnes Excel
 * (Interne - utilisé par le service)
 */
export const EXCEL_COLUMN_MAPPING = {
  email: ['email', 'Email', 'EMAIL', 'E-mail', 'Adresse Email', 'adresse email'],
  address: [
    'adresse',
    'Adresse',
    'ADRESSE',
    'Adresse Postale',
    'adresse postale',
    'rue',
    'Rue',
  ],
  fullName: [
    'Nom Complet',
    'nom complet',
    'NOM COMPLET',
    'Nom et Prenom',
    'nom et prenom',
  ],
  roomNumber: ['Chambre', 'chambre', 'CHAMBRE', 'Room', 'room', 'ROOM'],
  role: ['Rôle', 'rôle', 'Role', 'role', 'ROLE'],
};

/**
 * Rôles autorisés pour les utilisateurs
 */
export enum UserRole {
  OCCUPANT = 'OCCUPANT',
  GESTIONNAIRE = 'GESTIONNAIRE',
  ADMIN = 'ADMIN',
}

/**
 * Constantes pour la validation Excel
 */
export const EXCEL_VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  MIN_ADDRESS_LENGTH: 5,
  MAX_ADDRESS_LENGTH: 255,
  MIN_NAME_LENGTH: 3,
  MAX_EMAIL_LENGTH: 255,
  MAX_FILE_SIZE_MB: 5,
  BATCH_SIZE: 50,
};

/**
 * Messages d'erreur standardisés
 */
export const EXCEL_ERROR_MESSAGES = {
  INVALID_EMAIL: 'Email invalide',
  DUPLICATE_EMAIL: 'Email déjà utilisé',
  DUPLICATE_IN_FILE: 'Email en doublon dans le fichier',
  MISSING_EMAIL: 'Email manquant',
  MISSING_NAME: 'Nom complet manquant',
  ADDRESS_TOO_SHORT: 'Adresse trop courte (min 5 caractères)',
  ADDRESS_TOO_LONG: 'Adresse trop longue (max 255 caractères)',
  NAME_TOO_SHORT: 'Nom complet trop court (min 3 caractères)',
  INVALID_FILE_FORMAT: 'Format invalide. Utilisez un fichier Excel (.xlsx ou .xls)',
  FILE_TOO_LARGE: 'Fichier trop volumineux (max 5MB)',
  FILE_REQUIRED: 'Fichier requis',
};
