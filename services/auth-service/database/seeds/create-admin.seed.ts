// database/seeds/create-admin.seed.ts

import { DataSource } from 'typeorm';
import { AuthUserSchema } from '../../src/infrastructure/persistence/schemas/auth-user.schema';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

/**
 * Fonction de chiffrement (même logique que PasswordService)
 */
function encryptPassword(plainPassword: string, encryptionKey: string): string {
    const key = crypto.createHash('sha256').update(encryptionKey).digest('base64').substring(0, 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);

    let encrypted = cipher.update(plainPassword, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return `${iv.toString('hex')}:${encrypted}`;
}

export async function createSuperAdmin(dataSource: DataSource) {
    const userRepository = dataSource.getRepository(AuthUserSchema);

    // Vérifier si le SUPERADMIN existe déjà
    const existingSuperAdmin = await userRepository.findOne({
        where: { email: 'superadmin@immo360.cm' },
    });

    if (existingSuperAdmin) {
        console.log('✅ SUPERADMIN already exists');
        return;
    }

    const plainPassword = 'SuperAdmin123';
    const encryptionKey = process.env.PASSWORD_ENCRYPTION_KEY || 'immo360-password-encryption-key-change-in-production-32chars-minimum';
    const passwordEncrypted = encryptPassword(plainPassword, encryptionKey);

    // Créer l'utilisateur SUPERADMIN
    const superAdmin = userRepository.create({
        id: uuidv4(),
        email: 'superadmin@immo360.cm',
        passwordEncrypted,
        status: 'ACTIVE', // SUPERADMIN est actif d'office, pas besoin de vérification email
        emailVerified: true,
        failedLoginAttempts: 0,
        lastLoginAt: null,
        lockedUntil: null,
    });

    await userRepository.save(superAdmin);

    console.log('✅ SUPERADMIN created successfully');
    console.log('   Email: superadmin@immo360.cm');
    console.log('   Password: SuperAdmin123!');
    console.log('   Status: ACTIVE (email verified)');
}