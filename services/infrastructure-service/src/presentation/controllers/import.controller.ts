// src/presentation/controllers/import.controller.ts

import {
    Controller,
    Post,
    Get,
    Body,
    Query,
    HttpCode,
    HttpStatus,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    ParseFilePipe,
    MaxFileSizeValidator,
    FileTypeValidator,
    Logger,
    Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiConsumes,
    ApiBody,
    ApiQuery,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { ImportService, TypeImport, ImportServiceResult } from '../../application/services/import.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';

/**
 * Controller REST pour les imports de donnees via Excel
 */
@ApiTags('Import')
@ApiBearerAuth()
@Controller('import')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ImportController {
    private readonly logger = new Logger(ImportController.name);

    constructor(private readonly importService: ImportService) {}

    /**
     * Importe des donnees depuis un fichier Excel
     */
    @Post()
    @Roles('ADMIN', 'SUPER_ADMIN')
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(FileInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Importer des donnees depuis Excel' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'Fichier Excel (.xlsx)',
                },
                type: {
                    type: 'string',
                    enum: Object.values(TypeImport),
                    description: 'Type d\'import',
                },
            },
        },
    })
    @ApiResponse({ status: 200, description: 'Import termine' })
    @ApiResponse({ status: 400, description: 'Fichier ou donnees invalides' })
    async importFromExcel(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
                    new FileTypeValidator({
                        fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    }),
                ],
            }),
        )
        file: Express.Multer.File,
        @Body('type') type: TypeImport,
    ) {
        this.logger.log(`Starting import of type: ${type}, file: ${file.originalname}`);
        
        const result = await this.importService.importFromExcel(file.buffer, { type });

        return {
            success: result.success,
            message: result.success
                ? `Import termine: ${result.successCount}/${result.totalLines} lignes importees`
                : 'Import termine avec erreurs',
            data: {
                totalLines: result.totalLines,
                successCount: result.successCount,
                errorCount: result.errorCount,
                warningCount: result.warningCount,
                duration: result.duration,
            },
        };
    }

    /**
     * Valide un fichier Excel sans l'importer
     */
    @Post('validate')
    @Roles('ADMIN', 'SUPER_ADMIN')
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(FileInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Valider un fichier Excel sans importer' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'Fichier Excel (.xlsx)',
                },
                type: {
                    type: 'string',
                    enum: Object.values(TypeImport),
                    description: 'Type d\'import',
                },
            },
        },
    })
    @ApiResponse({ status: 200, description: 'Validation terminee' })
    async validateExcel(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
                    new FileTypeValidator({
                        fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    }),
                ],
            }),
        )
        file: Express.Multer.File,
        @Body('type') type: TypeImport,
    ) {
        this.logger.log(`Validating file: ${file.originalname} for type: ${type}`);
        
        const result = await this.importService.validateExcel(file.buffer, type);

        return {
            success: result.success,
            message: result.success
                ? 'Fichier valide, pret pour import'
                : 'Fichier contient des erreurs',
            data: {
                totalLines: result.totalLines,
                successCount: result.successCount,
                errorCount: result.errorCount,
                warningCount: result.warningCount,
                lines: result.lines,
            },
        };
    }

    /**
     * Recupere les colonnes requises pour un type d'import
     */
    @Get('template/columns')
    @Roles('ADMIN', 'SUPER_ADMIN')
    @ApiOperation({ summary: 'Obtenir les colonnes requises pour un type d\'import' })
    @ApiQuery({ name: 'type', required: true, enum: TypeImport })
    @ApiResponse({ status: 200, description: 'Colonnes du template' })
    async getTemplateColumns(@Query('type') type: TypeImport) {
        const columns = this.importService.getTemplateColumns(type);
        return {
            success: true,
            data: columns,
        };
    }

    /**
     * Recupere les valeurs autorisees pour les enums
     */
    @Get('enum-values')
    @Roles('ADMIN', 'SUPER_ADMIN')
    @ApiOperation({ summary: 'Obtenir les valeurs autorisees pour les enums' })
    @ApiQuery({ name: 'type', required: true, enum: TypeImport })
    @ApiResponse({ status: 200, description: 'Valeurs enum autorisees' })
    async getEnumValues(@Query('type') type: TypeImport) {
        const values = this.importService.getEnumValues(type);
        return {
            success: true,
            data: values,
        };
    }

    /**
     * Telecharge un template Excel vide
     */
    @Get('template/download')
    @Roles('ADMIN', 'SUPER_ADMIN')
    @ApiOperation({ summary: 'Telecharger un template Excel' })
    @ApiQuery({ name: 'type', required: true, enum: TypeImport })
    @ApiResponse({ status: 200, description: 'Fichier Excel template' })
    async downloadTemplate(
        @Query('type') type: TypeImport,
        @Res() res: Response,
    ) {
        this.logger.log(`Generating template for type: ${type}`);
        
        const buffer = await this.importService.generateTemplate(type);
        
        const filename = `template_${type.toLowerCase()}_${Date.now()}.xlsx`;
        
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        );
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${filename}"`,
        );
        
        res.send(buffer);
    }
}