// src/infrastructure/auth.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';  // ✅ AJOUTER

// Schemas
import { AuthUserSchema } from './persistence/schemas/auth-user.schema';
import { SessionSchema } from './persistence/schemas/session.schema';
import { RefreshTokenSchema } from './persistence/schemas/refresh-token.schema';
import { VerificationCodeSchema } from './persistence/schemas/verification-code.schema';

// Repositories
import { TypeOrmAuthUserRepository } from './persistence/repositories/typeorm-auth-user.repository';
import { TypeOrmSessionRepository } from './persistence/repositories/typeorm-session.repository';
import { TypeOrmRefreshTokenRepository } from './persistence/repositories/typeorm-refresh-token.repository';
import { TypeOrmVerificationCodeRepository } from './persistence/repositories/typeorm-verification-code.repository';

// Services
import { PasswordService } from '../application/services/password.service';
import { JwtTokenService } from '../application/services/jwt.service';
import { SessionManagerService } from '../application/services/session-manager.service';
import { EncryptionService } from '../application/services/encryption.service';
import { GoogleTokenVerifierService } from '../application/services/google-token-verifier.service';
import { GoogleOAuthService } from '../application/services/google-oauth.service';
import { VerificationCodeService } from '../application/services/verification-code.service';
import { EmailService } from '../application/services/email.service';
import { UserServiceClient } from '../application/services/user-service-client.service';  // ✅ AJOUTER

// Use Cases
import { LoginUseCase } from '../application/use-cases/login.use-case';
import { RefreshTokenUseCase } from '../application/use-cases/refresh-token.use-case';
import { LogoutUseCase } from '../application/use-cases/logout.use-case';
import { ChangePasswordUseCase } from '../application/use-cases/change-password.use-case';
import { VerifyEmailUseCase } from '../application/use-cases/verify-email.use-case';
import { VerifyEmailByCodeUseCase } from '../application/use-cases/verify-email-by-code.use-case';
import { GoogleTokenLoginUseCase } from '../application/use-cases/google-token-login.use-case';
import { SyncUserUseCase } from '../application/use-cases/sync-user.use-case';
import { ForgotPasswordUseCase } from '../application/use-cases/forgot-password.use-case';
import { ResetPasswordUseCase } from '../application/use-cases/reset-password.use-case';

// Controllers
import { AuthController } from './http/controllers/auth.controller';
import { InternalController } from './http/controllers/internal.controller';

// Health
import { HealthService } from './health/health.service';

// Guards & Strategies
import { JwtStrategy } from '../common/strategies/jwt.strategy';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

// RabbitMQ
import { RabbitMQEventModule } from './rabbitmq/rabbitmq-event.module';
import { UserRoleSyncHandler } from './rabbitmq/user-role-sync.handler';  // ✅ AJOUTER

@Module({
    imports: [
        ConfigModule,
        TypeOrmModule.forFeature([
            AuthUserSchema,
            SessionSchema,
            RefreshTokenSchema,
            VerificationCodeSchema,
        ]),
        JwtModule.register({}),
        HttpModule.register({  // ✅ AJOUTER pour UserServiceClient
            timeout: 5000,
            maxRedirects: 5,
        }),
        RabbitMQEventModule,
    ],
    controllers: [AuthController, InternalController],
    providers: [
        // Repositories
        {
            provide: 'IAuthUserRepository',
            useClass: TypeOrmAuthUserRepository,
        },
        {
            provide: 'ISessionRepository',
            useClass: TypeOrmSessionRepository,
        },
        {
            provide: 'IRefreshTokenRepository',
            useClass: TypeOrmRefreshTokenRepository,
        },
        {
            provide: 'IVerificationCodeRepository',
            useClass: TypeOrmVerificationCodeRepository,
        },

        // Services
        PasswordService,
        JwtTokenService,
        SessionManagerService,
        EncryptionService,
        GoogleTokenVerifierService,
        GoogleOAuthService,
        VerificationCodeService,
        EmailService,
        HealthService,
        UserServiceClient,  // ✅ AJOUTER

        // Use Cases
        LoginUseCase,
        RefreshTokenUseCase,
        LogoutUseCase,
        ChangePasswordUseCase,
        VerifyEmailUseCase,
        VerifyEmailByCodeUseCase,
        GoogleTokenLoginUseCase,
        SyncUserUseCase,
        ForgotPasswordUseCase,
        ResetPasswordUseCase,

        // Guards & Strategies
        JwtStrategy,
        JwtAuthGuard,
        RolesGuard,

        // RabbitMQ Handlers
        UserRoleSyncHandler,
    ],
    exports: [
        'IAuthUserRepository',
        'ISessionRepository',
        'IRefreshTokenRepository',
        'IVerificationCodeRepository',
        PasswordService,
        JwtTokenService,
        SessionManagerService,
        VerificationCodeService,
        UserServiceClient,  // ✅ EXPORTER
    ],
})
export class AuthModule {}