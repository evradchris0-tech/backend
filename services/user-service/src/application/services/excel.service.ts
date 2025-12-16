// src/application/services/excel.service.ts

import { Injectable, BadRequestException } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { OccupantExcelRow } from '../dtos/users/import-occupants.dto';

@Injectable()
export class ExcelService {
    /**
     * Parse un fichier Excel et retourne les données des occupants
     */
    parseOccupantsExcel(buffer: Buffer): OccupantExcelRow[] {
        try {
            const workbook = XLSX.read(buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];

            if (!sheetName) {
                throw new BadRequestException('Excel file is empty');
            }

            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            if (!jsonData || jsonData.length === 0) {
                throw new BadRequestException('Excel file contains no data');
            }

            // Mapper les colonnes Excel vers notre structure
            const occupants: OccupantExcelRow[] = jsonData.map((row: any, index: number) => {
                // Validation des colonnes obligatoires
                if (!row['Prénom'] && !row['firstName'] && !row['First Name']) {
                    throw new BadRequestException(`Row ${index + 2}: Missing firstName column`);
                }
                if (!row['Nom'] && !row['lastName'] && !row['Last Name']) {
                    throw new BadRequestException(`Row ${index + 2}: Missing lastName column`);
                }
                if (!row['Email'] && !row['email']) {
                    throw new BadRequestException(`Row ${index + 2}: Missing email column`);
                }
                if (!row['Numéro Chambre'] && !row['roomNumber'] && !row['Room Number']) {
                    throw new BadRequestException(`Row ${index + 2}: Missing roomNumber column`);
                }

                return {
                    firstName: row['Prénom'] || row['firstName'] || row['First Name'],
                    lastName: row['Nom'] || row['lastName'] || row['Last Name'],
                    email: row['Email'] || row['email'],
                    roomNumber: String(row['Numéro Chambre'] || row['roomNumber'] || row['Room Number']),
                    roomId: row['roomId'] || undefined, // Optionnel
                };
            });

            return occupants;
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException(`Failed to parse Excel file: ${error.message}`);
        }
    }

    /**
     * Valide les données des occupants
     */
    validateOccupantsData(occupants: OccupantExcelRow[]): { valid: boolean; errors: string[] } {
        const errors: string[] = [];
        const emails = new Set<string>();
        const roomNumbers = new Set<string>();

        occupants.forEach((occupant, index) => {
            const rowNumber = index + 2; // +2 car ligne 1 = header

            // Validation email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(occupant.email)) {
                errors.push(`Row ${rowNumber}: Invalid email format (${occupant.email})`);
            }

            // Vérifier les doublons d'email dans le fichier
            if (emails.has(occupant.email.toLowerCase())) {
                errors.push(`Row ${rowNumber}: Duplicate email (${occupant.email})`);
            }
            emails.add(occupant.email.toLowerCase());

            // Vérifier les doublons de numéro de chambre
            if (roomNumbers.has(occupant.roomNumber)) {
                errors.push(`Row ${rowNumber}: Duplicate room number (${occupant.roomNumber})`);
            }
            roomNumbers.add(occupant.roomNumber);

            // Validation firstName / lastName
            if (occupant.firstName.length < 2) {
                errors.push(`Row ${rowNumber}: First name too short (${occupant.firstName})`);
            }
            if (occupant.lastName.length < 2) {
                errors.push(`Row ${rowNumber}: Last name too short (${occupant.lastName})`);
            }
        });

        return {
            valid: errors.length === 0,
            errors,
        };
    }

    /**
     * Génère un fichier Excel template pour l'import
     */
    generateOccupantsTemplate(): Buffer {
        const data = [
            {
                'Prénom': 'Dave',
                'Nom': 'Arthur',
                'Email': 'dave.arthur@saintjeaningenieur.org',
                'Numéro Chambre': '205',
            },
            {
                'Prénom': 'Cheikh',
                'Nom': 'Kakfa',
                'Email': 'omgba.joseph@siantjeaningenieur.org',
                'Numéro Chambre': '206',
            },
        ];

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Occupants');

        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        return buffer;
    }
}