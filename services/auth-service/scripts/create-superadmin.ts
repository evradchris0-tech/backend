/**
 * Script de création/réinitialisation du superadmin
 * Architecture: IMMO360 Auth Service
 * 
 * USAGE:
 * 1. Placer dans: services/auth-service/scripts/create-superadmin.ts
 * 2. Exécuter: npx ts-node scripts/create-superadmin.ts
 */

import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

async function createSuperAdmin() {
    console.log('🔧 Initialisation de la connexion à PostgreSQL...\n');

    const dataSource = new DataSource({
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        username: process.env.DB_USERNAME || 'immo360_user',
        password: process.env.DB_PASSWORD || 'immo360MSAuth',
        database: process.env.DB_DATABASE || 'immo360_auth',
        synchronize: false,
        logging: true,
    });

    try {
        await dataSource.initialize();
        console.log('✅ Connexion établie\n');

        // ========================================
        // Configuration du compte
        // ========================================
        const email = 'superadmin@immo360.com';
        const plainPassword = 'NewAdmin@2025!';
        const BCRYPT_ROUNDS = 10;

        console.log('🔐 Hashage du mot de passe avec bcrypt (10 rounds)...');
        const passwordEncrypted = await bcrypt.hash(plainPassword, BCRYPT_ROUNDS);
        console.log(`✅ Hash généré: ${passwordEncrypted.substring(0, 30)}...\n`);

        // ========================================
        // Vérification de l'utilisateur existant
        // ========================================
        console.log('🔍 Recherche de l\'utilisateur existant...');
        const existingUsers = await dataSource.query(
            'SELECT id, email, status, email_verified FROM users WHERE email = $1',
            [email],
        );

        if (existingUsers.length > 0) {
            console.log('🔄 Utilisateur trouvé, mise à jour...\n');

            await dataSource.query(
                `UPDATE users 
         SET 
           password_encrypted = $1,
           status = $2,
           email_verified = $3,
           failed_login_attempts = $4,
           locked_until = NULL,
           updated_at = NOW()
         WHERE email = $5`,
                [passwordEncrypted, 'ACTIVE', true, 0, email],
            );

            console.log('✅ Utilisateur mis à jour avec succès!');
        } else {
            console.log('➕ Création du nouvel utilisateur...\n');

            const userId = uuidv4();

            await dataSource.query(
                `INSERT INTO users (
          id, 
          email, 
          password_encrypted, 
          status, 
          email_verified, 
          failed_login_attempts,
          created_at, 
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
                [userId, email, passwordEncrypted, 'ACTIVE', true, 0],
            );

            console.log('✅ Utilisateur créé avec succès!');
            console.log(`   ID: ${userId}`);
        }

        // ========================================
        // Test du mot de passe
        // ========================================
        console.log('\n🧪 Test de validation du mot de passe...');
        const finalUser = await dataSource.query(
            'SELECT password_encrypted FROM users WHERE email = $1',
            [email],
        );

        const isValid = await bcrypt.compare(plainPassword, finalUser[0].password_encrypted);
        console.log(`   Résultat: ${isValid ? '✅ VALIDE' : '❌ INVALIDE'}`);

        if (!isValid) {
            throw new Error('Erreur critique: Le mot de passe ne peut pas être validé!');
        }

        // ========================================
        // Résumé final
        // ========================================
        console.log('\n' + '='.repeat(60));
        console.log('📋 COMPTE SUPERADMIN CONFIGURÉ');
        console.log('='.repeat(60));
        console.log(`Email:        ${email}`);
        console.log(`Password:     ${plainPassword}`);
        console.log(`Status:       ACTIVE`);
        console.log(`Email vérifié: true`);
        console.log('='.repeat(60));

        // ========================================
        // Vérification finale
        // ========================================
        const verification = await dataSource.query(
            `SELECT 
        id, 
        email, 
        status, 
        email_verified,
        failed_login_attempts,
        locked_until,
        last_login_at,
        created_at,
        updated_at
      FROM users 
      WHERE email = $1`,
            [email],
        );

        console.log('\n✅ Vérification finale:');
        console.table(verification);

        // ========================================
        // Instructions de test
        // ========================================
        console.log('\n' + '='.repeat(60));
        console.log('🧪 COMMANDES DE TEST');
        console.log('='.repeat(60));
        console.log('\n1. Test direct sur auth-service:');
        console.log('   curl -X POST http://localhost:3001/auth/login \\');
        console.log('     -H "Content-Type: application/json" \\');
        console.log(`     -d '{"email":"${email}","password":"${plainPassword}"}'`);

        console.log('\n2. Ou via REST Client:');
        console.log('   POST http://localhost:3001/auth/login');
        console.log('   Content-Type: application/json\n');
        console.log('   {');
        console.log(`     "email": "${email}",`);
        console.log(`     "password": "${plainPassword}"`);
        console.log('   }');
        console.log('='.repeat(60) + '\n');

    } catch (error) {
        console.error('\n❌ ERREUR:', error.message);
        console.error('\nStack:', error.stack);
        throw error;
    } finally {
        await dataSource.destroy();
        console.log('🔌 Connexion fermée\n');
    }
}

// ========================================
// Exécution
// ========================================
createSuperAdmin()
    .then(() => {
        console.log('🎉 Script terminé avec succès!\n');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Script échoué\n');
        process.exit(1);
    });