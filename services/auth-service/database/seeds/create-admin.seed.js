"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSuperAdmin = createSuperAdmin;
const auth_user_schema_1 = require("../../src/infrastructure/persistence/schemas/auth-user.schema");
const crypto = __importStar(require("crypto"));
const uuid_1 = require("uuid");
function encryptPassword(plainPassword, encryptionKey) {
    const key = crypto.createHash('sha256').update(encryptionKey).digest('base64').substring(0, 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
    let encrypted = cipher.update(plainPassword, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
}
async function createSuperAdmin(dataSource) {
    const userRepository = dataSource.getRepository(auth_user_schema_1.AuthUserSchema);
    const existingSuperAdmin = await userRepository.findOne({
        where: { email: 'superadmin@immo360.cm' },
    });
    if (existingSuperAdmin) {
        console.log('✅ SUPERADMIN already exists');
        return;
    }
    const plainPassword = 'SuperAdmin123!';
    const encryptionKey = process.env.PASSWORD_ENCRYPTION_KEY || 'immo360-password-encryption-key-change-in-production-32chars-minimum';
    const passwordEncrypted = encryptPassword(plainPassword, encryptionKey);
    const superAdmin = userRepository.create({
        id: (0, uuid_1.v4)(),
        email: 'superadmin@immo360.cm',
        firstName: 'Super',
        lastName: 'Admin',
        passwordEncrypted,
        role: 'SUPERADMIN',
        status: 'ACTIVE',
        emailVerified: true,
        failedLoginAttempts: 0,
        lastLoginAt: null,
        lockedUntil: null,
        googleId: null,
        profilePicture: null,
        emailVerificationCode: null,
        emailVerificationCodeExpiresAt: null,
        username: null,
        currentRoomId: null,
        currentAcademicSessionId: null,
    });
    await userRepository.save(superAdmin);
    console.log('✅ SUPERADMIN created successfully');
    console.log('   Email: superadmin@immo360.cm');
    console.log('   Password: SuperAdmin123!');
    console.log('   Role: SUPERADMIN');
    console.log('   Status: ACTIVE (email verified)');
}
//# sourceMappingURL=create-admin.seed.js.map