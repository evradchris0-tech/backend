// src/application/services/excel-import.service.ts

import { Injectable, Logger, BadRequestException, Inject } from '@nestjs/common';
import * as XLSX from 'xlsx';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { UserDomainEventPublisher } from './user-domain-event-publisher.service';
import { RabbitMQPublisherService } from '../../infrastructure/events/rabbitmq-publisher.service';
import { UsersImportedEvent, ImportedUserDetails } from '../../domain/events/users-imported.event';
import { UserEntity, UserRole, UserStatus } from '../../domain/entities/user.entity';

/**
 * Resultat de l'import Excel
 */
export interface ExcelImportResult {
    success: number;
    errors: string[];
    warnings: string[];
    data: {
        email: string;
        fullName: string;
        roomNumber?: string;
        academicSession?: string;
        role: string;
    }[];
}

/**
 * Erreur de validation d'import
 */
export interface ImportValidationError {
    line: number;
    email: string;
    error: string;
}

/**
 * Resultat de la validation avant import
 */
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    rowCount: number;
}

@Injectable()
export class ExcelImportService {
    private readonly logger = new Logger(ExcelImportService.name);

    /**
     * Mapping des colonnes Excel vers les champs internes
     * Supporte plusieurs variantes de noms de colonnes
     */
    private readonly columnMapping: Record<string, string> = {
        // Email
        'Email': 'email',
        'email': 'email',
        'EMAIL': 'email',
        'E-mail': 'email',
        'Adresse Email': 'email',
        'Courriel': 'email',
        
        // Nom complet
        'Nom Complet': 'fullName',
        'nom complet': 'fullName',
        'Nom': 'fullName',
        'NOM': 'fullName',
        'Nom et Prenom': 'fullName',
        'Prenom Nom': 'fullName',
        'Full Name': 'fullName',
        
        // Prenom (si separe)
        'Prénom': 'firstName',
        'Prenom': 'firstName',
        'PRENOM': 'firstName',
        'First Name': 'firstName',
        
        // Nom de famille (si separe)
        'Nom de famille': 'lastName',
        'NOM DE FAMILLE': 'lastName',
        'Last Name': 'lastName',
        
        // Numero de chambre
        'Chambre': 'roomNumber',
        'chambre': 'roomNumber',
        'CHAMBRE': 'roomNumber',
        'N° Chambre': 'roomNumber',
        'Numéro Chambre': 'roomNumber',
        'Room': 'roomNumber',
        'Room Number': 'roomNumber',
        
        // Session academique
        'Session': 'academicSession',
        'Session Académique': 'academicSession',
        'Année Académique': 'academicSession',
        'Academic Session': 'academicSession',
        'Periode': 'academicSession',
        
        // Role (optionnel, defaut OCCUPANT)
        'Rôle': 'role',
        'role': 'role',
        'ROLE': 'role',
        'Role': 'role',
    };

    constructor(
        @Inject('IUserRepository')
        private readonly userRepo: IUserRepository,
        private readonly eventPublisher: UserDomainEventPublisher,
        private readonly rabbitMQPublisher: RabbitMQPublisherService,
    ) {}

    /**
     * Generation du template Excel pour le frontend
     * Colonnes: Email, Prenom, Nom, Chambre, Session Academique
     */
    async getTemplate(): Promise<Buffer> {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet([
            {
                'Email': 'jean.dupont@example.com',
                'Prénom': 'Jean',
                'Nom de famille': 'Dupont',
                'Chambre': '101',
                'Session Académique': '2025-2026',
            },
            {
                'Email': 'marie.martin@example.com',
                'Prénom': 'Marie',
                'Nom de famille': 'Martin',
                'Chambre': '102',
                'Session Académique': '2025-2026',
            },
            {
                'Email': 'pierre.durand@example.com',
                'Prénom': 'Pierre',
                'Nom de famille': 'Durand',
                'Chambre': '103',
                'Session Académique': '2025-2026',
            },
        ]);

        ws['!cols'] = [
            { wch: 30 },  // Email
            { wch: 15 },  // Prenom
            { wch: 15 },  // Nom
            { wch: 10 },  // Chambre
            { wch: 18 },  // Session
        ];

        XLSX.utils.book_append_sheet(wb, ws, 'Occupants');
        return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    }

    /**
     * Parse le fichier Excel
     */
    private parseExcelFile(buffer: Buffer): Record<string, any>[] {
        try {
            const wb = XLSX.read(buffer, { type: 'buffer' });
            const ws = wb.Sheets[wb.SheetNames[0]];

            if (!ws) {
                throw new Error('Aucune feuille trouvee dans le fichier Excel');
            }

            const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
            if (rows.length === 0) {
                throw new Error('Le fichier est vide');
            }

            return rows as Record<string, any>[];
        } catch (error) {
            this.logger.error('Erreur parsing Excel', error);
            throw new BadRequestException(`Erreur lecture fichier Excel: ${(error as Error).message}`);
        }
    }

    /**
     * Verifie les colonnes obligatoires
     */
    private validateFileStructure(rows: Record<string, any>[]): string[] {
        if (rows.length === 0) {
            return ['Le fichier est vide'];
        }

        const errors: string[] = [];
        const firstRow = rows[0];
        const columns = Object.keys(firstRow);

        // Verifier colonne Email
        const hasEmail = columns.some(col => this.columnMapping[col] === 'email');
        if (!hasEmail) {
            errors.push('Colonne Email manquante. Colonnes acceptees: Email, E-mail, Adresse Email');
        }

        // Verifier nom (fullName OU firstName+lastName)
        const hasFullName = columns.some(col => this.columnMapping[col] === 'fullName');
        const hasFirstName = columns.some(col => this.columnMapping[col] === 'firstName');
        const hasLastName = columns.some(col => this.columnMapping[col] === 'lastName');
        
        if (!hasFullName && !(hasFirstName && hasLastName)) {
            errors.push('Colonnes nom manquantes. Utilisez "Nom Complet" OU "Prénom" + "Nom de famille"');
        }

        // Verifier chambre (obligatoire pour OCCUPANT)
        const hasRoom = columns.some(col => this.columnMapping[col] === 'roomNumber');
        if (!hasRoom) {
            errors.push('Colonne Chambre manquante. Colonnes acceptees: Chambre, N° Chambre, Room');
        }

        return errors;
    }

    /**
     * Map une ligne Excel vers donnees normalisees
     */
    private mapExcelRowToUser(row: Record<string, any>): Record<string, any> {
        const mapped: Record<string, any> = {};

        for (const [col, value] of Object.entries(row)) {
            const field = this.columnMapping[col];
            if (field && value !== undefined && value !== null && value !== '') {
                mapped[field] = String(value).trim();
            }
        }

        // Construire fullName si firstName et lastName sont fournis separement
        if (!mapped.fullName && mapped.firstName && mapped.lastName) {
            mapped.fullName = `${mapped.firstName} ${mapped.lastName}`;
        }

        // Role par defaut: OCCUPANT
        if (!mapped.role) {
            mapped.role = 'OCCUPANT';
        }

        return mapped;
    }

    /**
     * Valide une ligne
     */
    private validateRow(mapped: Record<string, any>, lineNumber: number): string[] {
        const errors: string[] = [];

        // Email obligatoire et valide
        if (!mapped.email) {
            errors.push(`Ligne ${lineNumber}: Email manquant`);
        } else if (!this.isValidEmail(mapped.email)) {
            errors.push(`Ligne ${lineNumber}: Email invalide (${mapped.email})`);
        }

        // Nom obligatoire
        if (!mapped.fullName && !mapped.firstName) {
            errors.push(`Ligne ${lineNumber}: Nom manquant`);
        } else if (mapped.fullName && mapped.fullName.length < 3) {
            errors.push(`Ligne ${lineNumber}: Nom trop court (min 3 caracteres)`);
        }

        // Chambre obligatoire pour les occupants
        if (mapped.role === 'OCCUPANT' && !mapped.roomNumber) {
            errors.push(`Ligne ${lineNumber}: Numero de chambre manquant pour OCCUPANT`);
        }

        // Session academique (format YYYY-YYYY)
        if (mapped.academicSession && !/^\d{4}-\d{4}$/.test(mapped.academicSession)) {
            errors.push(`Ligne ${lineNumber}: Format session invalide (attendu: 2025-2026)`);
        }

        // Validation role
        const validRoles = ['OCCUPANT', 'AGENT_TERRAIN', 'SUPERVISOR', 'ADMINISTRATOR'];
        if (mapped.role && !validRoles.includes(mapped.role.toUpperCase())) {
            errors.push(`Ligne ${lineNumber}: Role invalide (${mapped.role})`);
        }

        return errors;
    }

    /**
     * Valide le format email
     */
    private isValidEmail(email: string): boolean {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    /**
     * Genere un mot de passe temporaire securise
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
     * Validation complete avant import
     */
    async validateBeforeImport(buffer: Buffer): Promise<ValidationResult> {
        const rows = this.parseExcelFile(buffer);
        const fileErrors = this.validateFileStructure(rows);

        if (fileErrors.length > 0) {
            return { isValid: false, errors: fileErrors, warnings: [], rowCount: 0 };
        }

        const errors: string[] = [];
        const warnings: string[] = [];
        const seenEmails = new Set<string>();
        const seenRooms = new Set<string>();

        for (let index = 0; index < rows.length; index++) {
            const mapped = this.mapExcelRowToUser(rows[index]);
            const rowErrors = this.validateRow(mapped, index + 2);
            
            if (rowErrors.length > 0) {
                errors.push(...rowErrors);
            }

            // Verifier doublons email dans le fichier
            if (mapped.email) {
                const lowerEmail = mapped.email.toLowerCase();
                if (seenEmails.has(lowerEmail)) {
                    errors.push(`Ligne ${index + 2}: Email en doublon dans le fichier (${mapped.email})`);
                }
                seenEmails.add(lowerEmail);

                // Verifier si email existe deja en base
                const existingUser = await this.userRepo.findByEmail(lowerEmail);
                if (existingUser) {
                    warnings.push(`Ligne ${index + 2}: Email deja existant en base (${mapped.email})`);
                }
            }

            // Verifier doublons chambre dans le fichier (pour occupants)
            if (mapped.roomNumber && mapped.role === 'OCCUPANT') {
                if (seenRooms.has(mapped.roomNumber)) {
                    warnings.push(`Ligne ${index + 2}: Chambre ${mapped.roomNumber} assignee a plusieurs occupants`);
                }
                seenRooms.add(mapped.roomNumber);
            }
        }

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
        
        if (fileErrors.length > 0) {
            throw new BadRequestException(fileErrors.join(', '));
        }

        const validatedRows: { row: Record<string, any>; lineNumber: number }[] = [];
        const errors: ImportValidationError[] = [];
        const warnings: string[] = [];

        rows.forEach((r, index) => {
            const mapped = this.mapExcelRowToUser(r);
            const rowErrors = this.validateRow(mapped, index + 2);

            if (rowErrors.length > 0) {
                errors.push({
                    line: index + 2,
                    email: mapped.email || 'N/A',
                    error: rowErrors.join('; '),
                });
            } else {
                validatedRows.push({ row: mapped, lineNumber: index + 2 });
            }
        });

        const { successCount, importedUsers } = await this.batchImportUsers(validatedRows, errors, warnings);

        await this.publishUsersImportedEvent(importedUsers, successCount);

        return {
            success: successCount,
            errors: errors.map(e => `Ligne ${e.line}: ${e.error}`),
            warnings,
            data: validatedRows.map(v => ({
                email: v.row.email,
                fullName: v.row.fullName,
                roomNumber: v.row.roomNumber,
                academicSession: v.row.academicSession,
                role: v.row.role,
            })),
        };
    }

    /**
     * Batch import avec traitement par lots
     */
    private async batchImportUsers(
        validatedRows: { row: Record<string, any>; lineNumber: number }[],
        errors: ImportValidationError[],
        warnings: string[],
    ): Promise<{ successCount: number; importedUsers: UserEntity[] }> {
        const batchSize = 50;
        let successCount = 0;
        const imported: UserEntity[] = [];

        for (let i = 0; i < validatedRows.length; i += batchSize) {
            const batch = validatedRows.slice(i, i + batchSize);

            const results = await Promise.allSettled(
                batch.map(item => this.importSingleUser(item.row, item.lineNumber, warnings)),
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
                        error: res.reason?.message || 'Erreur inconnue',
                    });
                }
            });
        }

        return { successCount, importedUsers: imported };
    }

    /**
     * Import d'un utilisateur unique avec generation de mot de passe
     */
    private async importSingleUser(
        row: Record<string, any>,
        lineNumber: number,
        warnings: string[],
    ): Promise<UserEntity | null> {
        // Verifier doublon email
        const existing = await this.userRepo.findByEmail(row.email.toLowerCase());
        if (existing) {
            warnings.push(`Ligne ${lineNumber}: Email existe deja, ignore (${row.email})`);
            return null;
        }

        // Extraire prenom et nom
        let firstName: string;
        let lastName: string;

        if (row.firstName && row.lastName) {
            firstName = row.firstName;
            lastName = row.lastName;
        } else if (row.fullName) {
            const parts = row.fullName.split(' ');
            firstName = parts[0];
            lastName = parts.slice(1).join(' ') || parts[0];
        } else {
            throw new Error('Nom manquant');
        }

        // Generer mot de passe temporaire
        const temporaryPassword = this.generateTemporaryPassword();
        const hashedPassword = await bcrypt.hash(temporaryPassword, 12);

        this.logger.log(`Mot de passe genere pour ${row.email}: ${temporaryPassword}`);

        // Creer l'entite utilisateur
        const user = new UserEntity(
            uuidv4(),
            row.email.toLowerCase(),
            firstName,
            lastName,
            hashedPassword,
            (row.role || 'OCCUPANT').toUpperCase() as UserRole,
            UserStatus.ACTIVE,
        );

        // Marquer email comme verifie (import admin)
        user.verifyEmail();

        // Assigner chambre si OCCUPANT
        if (user.role === UserRole.OCCUPANT && row.roomNumber) {
            const roomId = uuidv4(); // TODO: Rechercher vraie chambre dans infrastructure-service
            const academicSession = row.academicSession || this.getCurrentAcademicSession();
            user.assignToRoom(roomId, row.roomNumber, academicSession);
        }

        // Sauvegarder en base
        const savedUser = await this.userRepo.save(user);

        // Publier evenement RabbitMQ
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
            this.logger.log(`Published user.created event for ${savedUser.email}`);
        } catch (error) {
            this.logger.error(`Failed to publish event for ${savedUser.email}:`, error);
        }

        return savedUser;
    }

    /**
     * Retourne la session academique courante (format YYYY-YYYY)
     */
    private getCurrentAcademicSession(): string {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        
        // Si on est entre septembre et decembre, c'est annee-annee+1
        // Sinon c'est annee-1-annee
        if (month >= 8) { // Septembre = 8
            return `${year}-${year + 1}`;
        }
        return `${year - 1}-${year}`;
    }

    /**
     * Publication de l'evenement domain UsersImportedEvent
     */
    private async publishUsersImportedEvent(importedUsers: UserEntity[], total: number): Promise<void> {
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
     * Export des utilisateurs en Excel
     */
    async exportUsers(filters?: { role?: UserRole; status?: UserStatus }): Promise<Buffer> {
        try {
            const { users } = await this.userRepo.findAllPaginated({}, { skip: 0, take: 10000 });

            let filteredUsers = users;
            if (filters?.role) {
                filteredUsers = filteredUsers.filter(u => u.role === filters.role);
            }
            if (filters?.status) {
                filteredUsers = filteredUsers.filter(u => u.status === filters.status);
            }

            const data = filteredUsers.map(user => ({
                'Email': user.email,
                'Prénom': user.firstName,
                'Nom': user.lastName,
                'Rôle': user.role,
                'Statut': user.status,
                'Email Vérifié': user.emailVerified ? 'OUI' : 'NON',
                'Chambre': user.currentRoomId || '',
                'Session': user.currentAcademicSessionId || '',
                'Créé le': user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : '',
            }));

            const worksheet = XLSX.utils.json_to_sheet(data);
            
            worksheet['!cols'] = [
                { wch: 30 },  // Email
                { wch: 15 },  // Prenom
                { wch: 15 },  // Nom
                { wch: 15 },  // Role
                { wch: 12 },  // Statut
                { wch: 12 },  // Verifie
                { wch: 10 },  // Chambre
                { wch: 12 },  // Session
                { wch: 12 },  // Date
            ];

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Utilisateurs');

            return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        } catch (error) {
            this.logger.error('Erreur export Excel:', error);
            throw new Error('Impossible d\'exporter les utilisateurs');
        }
    }
}