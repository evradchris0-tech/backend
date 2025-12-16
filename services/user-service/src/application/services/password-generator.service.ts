import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class PasswordGeneratorService {
    /**
     * Génère un mot de passe temporaire sécurisé
     * Format: 12 caractères (Majuscules + Minuscules + Chiffres + Symboles)
     */
    generateTemporaryPassword(): string {
        const length = 12;
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const numbers = '0123456789';
        const symbols = '@#$!%*?&';

        const allChars = uppercase + lowercase + numbers + symbols;

        let password = '';
        
        // Garantir au moins 1 caractère de chaque type
        password += uppercase[crypto.randomInt(0, uppercase.length)];
        password += lowercase[crypto.randomInt(0, lowercase.length)];
        password += numbers[crypto.randomInt(0, numbers.length)];
        password += symbols[crypto.randomInt(0, symbols.length)];

        // Remplir le reste aléatoirement
        for (let i = password.length; i < length; i++) {
            password += allChars[crypto.randomInt(0, allChars.length)];
        }

        // Mélanger les caractères
        return password.split('').sort(() => crypto.randomInt(-1, 2)).join('');
    }
}