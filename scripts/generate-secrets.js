#!/usr/bin/env node

/**
 * Script pour générer des secrets sécurisés pour le déploiement
 * Usage: node scripts/generate-secrets.js
 */

const crypto = require('crypto');

console.log('\n🔐 Génération des secrets pour IMMO360\n');
console.log('═'.repeat(60));

// Générer JWT Secret
const jwtSecret = crypto.randomBytes(32).toString('hex');
console.log('\n✅ JWT_SECRET (pour signature des tokens):');
console.log(jwtSecret);

// Générer un second secret pour production
const jwtSecretProd = crypto.randomBytes(32).toString('hex');
console.log('\n✅ JWT_SECRET_PRODUCTION (différent de dev):');
console.log(jwtSecretProd);

// Générer un secret pour les refresh tokens
const refreshSecret = crypto.randomBytes(32).toString('hex');
console.log('\n✅ REFRESH_TOKEN_SECRET (optionnel):');
console.log(refreshSecret);

// Générer un secret pour le chiffrement
const encryptionKey = crypto.randomBytes(32).toString('hex');
console.log('\n✅ ENCRYPTION_KEY (pour chiffrer données sensibles):');
console.log(encryptionKey);

console.log('\n' + '═'.repeat(60));
console.log('\n📋 Instructions:');
console.log('\n1. Copier JWT_SECRET dans votre Environment Group Render');
console.log('2. Ne JAMAIS commiter ces secrets dans Git');
console.log('3. Utiliser des secrets différents pour dev/staging/prod');
console.log('4. Faire une rotation tous les 90 jours');

console.log('\n💡 Pour ajouter dans Render:');
console.log('\n   Dashboard → Environment Groups → immo360-shared');
console.log('   Add Environment Variable → JWT_SECRET → Paste');

console.log('\n⚠️  Sécurité:');
console.log('\n   - Minimum 32 caractères (✅)');
console.log('   - Caractères aléatoires (✅)');
console.log('   - Unique par environnement (à faire manuellement)');
console.log('   - Stockage sécurisé (Render Environment Groups)');

console.log('\n' + '═'.repeat(60) + '\n');

// Générer également un exemple de RABBITMQ_URL
console.log('📝 Format RABBITMQ_URL (CloudAMQP):');
console.log('\n   amqps://username:password@hostname.cloudamqp.com/vhost');
console.log('\n   Obtenir depuis: https://customer.cloudamqp.com');
console.log('\n' + '═'.repeat(60) + '\n');
