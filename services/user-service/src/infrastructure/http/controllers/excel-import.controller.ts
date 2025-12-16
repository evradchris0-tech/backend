import {
  Controller,
  Post,
  Get,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Logger,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ExcelImportService } from '../../../application/services/excel-import.service';

@Controller('users/import')
export class ExcelImportController {
  private readonly logger = new Logger(ExcelImportController.name);

  constructor(private readonly excelImportService: ExcelImportService) {}

  /**
   * GET /users/import/template
   * Télécharger le template Excel
   */
  @Get('template')
  async downloadTemplate(@Res() res: Response) {
    try {
      const buffer = await this.excelImportService.getTemplate();

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="template-utilisateurs.xlsx"');
      res.send(buffer);
    } catch (error) {
      this.logger.error('Erreur téléchargement template', error);
      throw new BadRequestException('Erreur génération template');
    }
  }

  /**
   * POST /users/import/validate
   * Valider le fichier AVANT import (sans créer les utilisateurs)
   */
  @Post('validate')
  @UseInterceptors(FileInterceptor('file'))
  async validateExcelFile(@UploadedFile() file: Express.Multer.File) {
    try {
      if (!file) {
        throw new BadRequestException('Fichier requis');
      }

      // Valider les types
      const allowedMimes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
      ];

      if (!allowedMimes.includes(file.mimetype)) {
        throw new BadRequestException(
          'Format invalide. Utilisez un fichier Excel (.xlsx ou .xls)',
        );
      }

      // Taille max 5MB
      if (file.size > 5 * 1024 * 1024) {
        throw new BadRequestException('Fichier trop volumineux (max 5MB)');
      }

      // Valider le fichier
      const validation = await this.excelImportService.validateBeforeImport(
        file.buffer,
      );

      this.logger.log(
        `Validation: ${validation.rowCount} lignes, ${validation.errors.length} erreurs`,
      );

      return {
        success: validation.isValid,
        rowCount: validation.rowCount,
        errors: validation.errors,
        warnings: validation.warnings,
        message: validation.isValid
          ? `✅ ${validation.rowCount} lignes valides, prêtes à importer`
          : `❌ ${validation.errors.length} erreurs trouvées`,
      };
    } catch (error) {
      this.logger.error('Erreur validation', error);
      throw error;
    }
  }

  /**
   * POST /users/import/upload
   * Importer le fichier Excel (créer les utilisateurs)
   * 
   * ✅ TOUS les utilisateurs auront isVerified = true automatiquement
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async importExcelFile(@UploadedFile() file: Express.Multer.File) {
    try {
      if (!file) {
        throw new BadRequestException('Fichier requis');
      }

      // Valider les types
      const allowedMimes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
      ];

      if (!allowedMimes.includes(file.mimetype)) {
        throw new BadRequestException(
          'Format invalide. Utilisez un fichier Excel (.xlsx ou .xls)',
        );
      }

      // Taille max 5MB
      if (file.size > 5 * 1024 * 1024) {
        throw new BadRequestException('Fichier trop volumineux (max 5MB)');
      }

      // Importer
      const result = await this.excelImportService.importFromExcel(file.buffer);

      this.logger.log(
        `Import terminé: ${result.success} succès, ${result.errors.length} erreurs`,
      );

      return {
        success: result.success > 0,
        imported: result.success,
        errors: result.errors,
        warnings: result.warnings,
        message: 
          result.success > 0
            ? `✅ ${result.success} utilisateurs importés avec succès (isVerified = true)`
            : '❌ Aucun utilisateur importé',
      };
    } catch (error) {
      this.logger.error('Erreur import', error);
      throw error;
    }
  }

  /**
   * GET /users/import/export
   * Exporter les utilisateurs existants en Excel
   * ✅ Format XLSX avec timestamp dans le nom de fichier
   */
  @Get('export')
  async exportToExcel(@Res() res: Response) {
    try {
      const buffer = await this.excelImportService.exportUsers();

      // ✅ Nom de fichier avec date (YYYY-MM-DD)
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `utilisateurs-export-${timestamp}.xlsx`;

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${filename}"`,
      );
      res.setHeader('Content-Length', buffer.length.toString());
      
      res.send(buffer);
      
      this.logger.log(`✅ Export réussi: ${filename}`);
    } catch (error) {
      this.logger.error('Erreur export', error);
      throw new BadRequestException('Erreur export');
    }
  }
}