import { Injectable, Logger, BadRequestException, Inject } from '@nestjs/common';
import * as XLSX from 'xlsx';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { CreateUserDto } from '../dtos/users/create-user.dto';
import { CreateUserUseCase } from '../use-cases/users/create-user.use-case';
import { UserDomainEventPublisher } from './user-domain-event-publisher.service';
import { RabbitMQPublisherService } from '../../infrastructure/events/rabbitmq-publisher.service';
import { UsersImportedEvent, ImportedUserDetails } from '../../domain/events/users-imported.event';
import { UserEntity, UserRole, UserStatus } from '../../domain/entities/user.entity';


export interface ExcelImportResult {
    success: number;
    errors: string[];
    warnings: string[];
    data: {
        email: string;
        fullName: string;
        address?: string;
        roomNumber?: string;
        role: string;
        isVerified: boolean;
    }[];
}

export interface ImportValidationError {
    line: number;
    email: string;
    address?: string;
    error: string;
}

@Injectable()
export class ExcelImportService {
    private readonly logger = new Logger(ExcelImportService.name);

    private readonly columnMapping = {
        'Email': 'email', 'email': 'email', 'EMAIL': 'email', 'E-mail': 'email', 'Adresse Email': 'email',
        'Adresse': 'address', 'adresse': 'address', 'ADRESSE': 'address', 'Adresse Postale': 'address', 'Rue': 'address',
        'Nom Complet': 'fullName', 'nom complet': 'fullName', 'Nom': 'fullName', 'Nom et Prenom': 'fullName', 'Prenom Nom': 'fullName',
        'Chambre': 'roomNumber', 'chambre': 'roomNumber', 'CHAMBRE': 'roomNumber', 'N° Chambre': 'roomNumber', 'Room': 'roomNumber',
        'Rôle': 'role', 'role': 'role', 'ROLE': 'role',
    };

    constructor(
        @Inject('IUserRepository')
        private readonly userRepo: IUserRepository,

        private readonly createUserUseCase: CreateUserUseCase,
        private readonly eventPublisher: UserDomainEventPublisher,
        private readonly rabbitMQPublisher: RabbitMQPublisherService,
    ) {}

    /**
     * Génération du template Excel pour le frontend
     */
    async getTemplate(): Promise<Buffer> {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet([
            { 'Email': 'jean.dupont@example.com', 'Nom Complet': 'Jean Dupont', 'Adresse': '123 Rue', 'Chambre': '101', 'Rôle': 'OCCUPANT' },
            { 'Email': 'marie.martin@example.com', 'Nom Complet': 'Marie Martin', 'Adresse': '456 Avenue', 'Chambre': '102', 'Rôle': 'OCCUPANT' },
        ]);

        ws['!cols'] = [
            { wch: 25 },
            { wch: 20 },
            { wch: 40 },
            { wch: 10 },
            { wch: 12 },
        ];

        XLSX.utils.book_append_sheet(wb, ws, 'Utilisateurs');
        return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    }

    /**
     * Parse le fichier Excel
     */
    private parseExcelFile(buffer: Buffer): any[] {
        try {
            const wb = XLSX.read(buffer, { type: 'buffer' });
            const ws = wb.Sheets[wb.SheetNames[0]];

            if (!ws) throw new Error('Aucune feuille trouvée dans le fichier Excel');

            const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
            if (rows.length === 0) throw new Error('Le fichier est vide');

            return rows;
        } catch (error) {
            this.logger.error('Erreur parsing Excel', error);
            throw new BadRequestException(`Erreur lecture fichier Excel: ${error.message}`);
        }
    }

    /**
     * Vérifie les colonnes obligatoires
     */
    private validateFileStructure(rows: any[]): string[] {
        if (rows.length === 0) return ['Le fichier est vide'];

        const firstRow = rows[0];
        const hasEmail = Object.keys(firstRow).some(
            col => this.columnMapping[col] === 'email'
        );

        if (!hasEmail)
            return ['Colonne Email manquante. Utilisez: Email, Adresse Email, E-mail'];

        return [];
    }

    /**
     * Map une ligne Excel → données normalisées
     */
    private mapExcelRowToUser(row: any): any {
        const mapped: any = { isVerified: true };

        for (const [col, value] of Object.entries(row)) {
            const field = this.columnMapping[col];
            if (field && value) mapped[field] = String(value).trim();
        }
        return mapped;
    }

    /**
     * Valide une ligne
     */
    private validateRow(mapped: any, lineNumber: number): string[] {
        const errors = [];

        if (!mapped.email) errors.push(`Ligne ${lineNumber}: Email manquant`);
        else if (!this.isValidEmail(mapped.email)) errors.push(`Ligne ${lineNumber}: Email invalide (${mapped.email})`);

        if (!mapped.fullName) errors.push(`Ligne ${lineNumber}: Nom complet manquant`);

        if (!mapped.address) errors.push(`Ligne ${lineNumber}: Adresse manquante`);
        else if (mapped.address.length < 5) errors.push(`Ligne ${lineNumber}: Adresse trop courte`);
        else if (mapped.address.length > 255) errors.push(`Ligne ${lineNumber}: Adresse trop longue`);

        if (!mapped.role) mapped.role = 'OCCUPANT';

        return errors;
    }

    private isValidEmail(email: string): boolean {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    /**
     * Génère un mot de passe temporaire sécurisé
     */
    private generateTemporaryPassword(): string {
        const length = 12;
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const numbers = '0123456789';
        const symbols = '@#$!%*?&';
        const allChars = uppercase + lowercase + numbers + symbols;

        let password = '';
        password += uppercase[crypto.randomInt(0, uppercase.length)];
        password += lowercase[crypto.randomInt(0, lowercase.length)];
        password += numbers[crypto.randomInt(0, numbers.length)];
        password += symbols[crypto.randomInt(0, symbols.length)];

        for (let i = password.length; i < length; i++) {
            password += allChars[crypto.randomInt(0, allChars.length)];
        }

        return password.split('').sort(() => crypto.randomInt(-1, 2)).join('');
    }

    /**
     * Validation complète avant import
     */
    async validateBeforeImport(buffer: Buffer) {
        const rows = this.parseExcelFile(buffer);
        const fileErrors = this.validateFileStructure(rows);

        if (fileErrors.length > 0)
            return { isValid: false, errors: fileErrors, warnings: [], rowCount: 0 };

        const errors: string[] = [];
        const warnings: string[] = [];
        const seen = new Set<string>();

        rows.forEach((r, index) => {
            const mapped = this.mapExcelRowToUser(r);
            const rowErrors = this.validateRow(mapped, index + 2);
            if (rowErrors.length > 0) errors.push(...rowErrors);

            if (mapped.email) {
                const lower = mapped.email.toLowerCase();
                if (seen.has(lower))
                    warnings.push(`Ligne ${index + 2}: Email dupliqué (${mapped.email})`);
                seen.add(lower);
            }
        });

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            rowCount: rows.length,
        };
    }

    /**
     * Import principal
     */
    async importFromExcel(buffer: Buffer): Promise<ExcelImportResult> {
        const rows = this.parseExcelFile(buffer);
        const fileErrors = this.validateFileStructure(rows);
        if (fileErrors.length > 0)
            throw new BadRequestException(fileErrors.join(', '));

        const validatedRows = [];
        const errors: ImportValidationError[] = [];
        const warnings: string[] = [];

        rows.forEach((r, index) => {
            const mapped = this.mapExcelRowToUser(r);
            const rowErrors = this.validateRow(mapped, index + 2);

            if (rowErrors.length > 0) {
                errors.push({
                    line: index + 2,
                    email: r.email || 'N/A',
                    address: r.address || 'N/A',
                    error: rowErrors.join('; '),
                });
            } else {
                mapped.isVerified = true;
                validatedRows.push({ row: mapped, lineNumber: index + 2 });
            }
        });

        const { successCount, importedUsers } = await this.batchImportUsers(validatedRows, errors, warnings);

        await this.publishUsersImportedEvent(importedUsers, successCount);

        return {
            success: successCount,
            errors: errors.map(e => `Ligne ${e.line}: ${e.error}`),
            warnings,
            data: validatedRows.map(v => v.row),
        };
    }

    /**
     * Batch import
     */
    private async batchImportUsers(validatedRows: any[], errors: ImportValidationError[], warnings: string[]) {
        const batchSize = 50;
        let successCount = 0;
        const imported: UserEntity[] = [];

        for (let i = 0; i < validatedRows.length; i += batchSize) {
            const batch = validatedRows.slice(i, i + batchSize);

            const results = await Promise.allSettled(
                batch.map(item => this.importSingleUser(item.row, item.lineNumber, errors, warnings)),
            );

            results.forEach((res, idx) => {
                const item = batch[idx];
                if (res.status === 'fulfilled' && res.value) {
                    imported.push(res.value);
                    successCount++;
                } else if (res.status === 'rejected') {
                    errors.push({
                        line: item.lineNumber,
                        email: item.row.email,
                        address: item.row.address,
                        error: res.reason?.message || 'Erreur inconnue',
                    });
                }
            });
        }

        return { successCount, importedUsers: imported };
    }

    /**
     * Import d'une ligne avec génération de mot de passe
     */
    private async importSingleUser(row: any, lineNumber: number, errors: ImportValidationError[], warnings: string[]) {
        const existing = await this.userRepo.findByEmail(row.email.toLowerCase());
        if (existing) {
            warnings.push(`Ligne ${lineNumber}: Email existe déjà (${row.email})`);
            return null;
        }

        const [firstName, ...rest] = row.fullName.split(' ');
        const lastName = rest.join(' ') || firstName;

        // ✅ GÉNÉRER MOT DE PASSE TEMPORAIRE
        const temporaryPassword = this.generateTemporaryPassword();
        const hashedPassword = await bcrypt.hash(temporaryPassword, 12);

        this.logger.log(`🔑 Mot de passe généré pour ${row.email}: ${temporaryPassword}`);

        const user = new UserEntity(
            uuidv4(),
            row.email.toLowerCase(),
            firstName,
            lastName,
            hashedPassword,
            (row.role || 'OCCUPANT') as UserRole,
            UserStatus.ACTIVE,
        );

        user.verifyEmail();

        const savedUser = await this.userRepo.save(user);

        // ✅ PUBLIER ÉVÉNEMENT RABBITMQ AVEC PASSWORD TEMPORAIRE
        try {
            await this.rabbitMQPublisher.publishUserCreated({
                userId: savedUser.id,
                email: savedUser.email,
                firstName: savedUser.firstName,
                lastName: savedUser.lastName,
                role: savedUser.role,
                temporaryPassword: temporaryPassword,
                passwordEncrypted: hashedPassword,
                status: savedUser.status,
                emailVerified: savedUser.emailVerified,
            });
            this.logger.log(`📤 Published user.created event for ${savedUser.email}`);
        } catch (error) {
            this.logger.error(`Failed to publish event for ${savedUser.email}:`, error);
        }

        return savedUser;
    }

    /**
     * Publication de l'événement domain UsersImportedEvent
     */
    private async publishUsersImportedEvent(importedUsers: UserEntity[], total: number) {
        if (total === 0) return;

        const details: ImportedUserDetails[] = importedUsers.map(u => ({
            userId: u.id,
            email: u.email,
            fullName: u.fullName,
            role: u.role,
        }));

        const event = new UsersImportedEvent(
            importedUsers.map(u => u.id),
            details,
            new Date(),
            'system',
            total,
            { batchSize: 50 },
        );

        await this.eventPublisher.publishUsersImported(event);
    }

    /**
     * Export des utilisateurs en Excel avec filtres
     */
    async exportUsers(filters?: { role?: UserRole; status?: UserStatus }): Promise<Buffer> {
        try {
            // Récupérer tous les utilisateurs
            const { users } = await this.userRepo.findAllPaginated({}, { skip: 0, take: 10000 });

            // Filtrer si nécessaire
            let filteredUsers = users;
            if (filters?.role) {
                filteredUsers = filteredUsers.filter(u => u.role === filters.role);
            }
            if (filters?.status) {
                filteredUsers = filteredUsers.filter(u => u.status === filters.status);
            }

            // Préparer les données pour Excel
            const data = filteredUsers.map(user => ({
                'Email': user.email,
                'Nom Complet': user.fullName,
                'Rôle': user.role,
                'Vérifié': user.emailVerified ? 'OUI' : 'NON',
                'Statut': user.status,
                'Créé le': user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : '',
            }));

            // Créer le workbook
            const worksheet = XLSX.utils.json_to_sheet(data);
            
            // Définir la largeur des colonnes
            worksheet['!cols'] = [
                { wch: 30 },  // Email
                { wch: 25 },  // Nom Complet
                { wch: 15 },  // Rôle
                { wch: 10 },  // Vérifié
                { wch: 15 },  // Statut
                { wch: 15 },  // Créé le
            ];

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Utilisateurs');

            // ✅ Générer le buffer en format XLSX
            const buffer = XLSX.write(workbook, {
                type: 'buffer',
                bookType: 'xlsx',
            });

            return buffer;
        } catch (error) {
            this.logger.error('Erreur export Excel:', error);
            throw new Error('Impossible d\'exporter les utilisateurs');
        }
    }

    /**
     * @deprecated Utiliser exportUsers() à la place
     */
    async exportToExcel(): Promise<Buffer> {
        return this.exportUsers();
    }
}