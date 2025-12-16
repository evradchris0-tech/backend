// src/infrastructure/http/controllers/auth.controller.ts

import {
    Controller,
    Post,
    Get,
    Body,
    Query,
    Res,
    Req,
    UseGuards,
    HttpCode,
    HttpStatus,
    BadRequestException,
    NotFoundException,
    Patch,
    Inject,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { LoginDto } from '../../../application/dtos/login.dto';
import { RefreshTokenDto } from '../../../application/dtos/refresh-token.dto';
import { ChangePasswordDto } from '../../../application/dtos/change-password.dto';
import { VerifyEmailDto } from '../../../application/dtos/verify-email.dto';
import { GoogleTokenLoginDto } from '../../../application/dtos/google-token-login.dto';
import { GoogleOAuthCallbackDto } from '../../../application/dtos/google-oauth-callback.dto';
import { LoginUseCase } from '../../../application/use-cases/login.use-case';
import { RefreshTokenUseCase } from '../../../application/use-cases/refresh-token.use-case';
import { LogoutUseCase } from '../../../application/use-cases/logout.use-case';
import { ChangePasswordUseCase } from '../../../application/use-cases/change-password.use-case';
import { VerifyEmailUseCase } from '../../../application/use-cases/verify-email.use-case';
import { VerifyEmailByCodeUseCase } from '../../../application/use-cases/verify-email-by-code.use-case';
import { GoogleTokenLoginUseCase } from '../../../application/use-cases/google-token-login.use-case';
import { GoogleOAuthService } from '../../../application/services/google-oauth.service';
import { GoogleTokenVerifierService } from '../../../application/services/google-token-verifier.service';
import { HealthService } from '../../health/health.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { Public } from '../../../common/decorators/public.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Ip } from '../../../common/decorators/ip.decorator';
import { UserAgent } from '../../../common/decorators/user-agent.decorator';
import { IAuthUserRepository } from '../../../domain/repositories/auth-user.repository.interface';
import { LogoutDto } from '@application/dtos/logout.dto';
import { JwtPayloadExtended } from '../../../common/interfaces/jwt-payload.interface';


@Controller('auth')
export class AuthController {
    constructor(
        private readonly loginUseCase: LoginUseCase,
        private readonly refreshTokenUseCase: RefreshTokenUseCase,
        private readonly logoutUseCase: LogoutUseCase,
        private readonly changePasswordUseCase: ChangePasswordUseCase,
        private readonly verifyEmailUseCase: VerifyEmailUseCase,
        private readonly verifyEmailByCodeUseCase: VerifyEmailByCodeUseCase,
        private readonly googleTokenLoginUseCase: GoogleTokenLoginUseCase,
        private readonly googleOAuthService: GoogleOAuthService,
        private readonly googleTokenVerifier: GoogleTokenVerifierService,
        private readonly healthService: HealthService,
        @Inject('IAuthUserRepository')
        private readonly authUserRepository: IAuthUserRepository,
    ) { }

    /**
     * Health check endpoint avec vérification DB
     * Retourne 200 si tout est OK, 503 si la DB est down
     */
    @Public()
    @Get('health')
    async health(@Res() res: Response) {
        const healthStatus = await this.healthService.checkHealth();

        const httpStatus = healthStatus.status === 'ok'
            ? HttpStatus.OK
            : HttpStatus.SERVICE_UNAVAILABLE;

        return res.status(httpStatus).json(healthStatus);
    }

    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(
        @Body() loginDto: LoginDto,
        @Ip() ipAddress: string,
        @UserAgent() userAgent: string,
    ) {
        return this.loginUseCase.execute(loginDto, ipAddress, userAgent);
    }

    /**
 * Get current user profile
 */
    @UseGuards(JwtAuthGuard)
    @Get('profile')
    async getProfile(@CurrentUser() user: any) {
        const authUser = await this.authUserRepository.findById(user.userId);

        if (!authUser) {
            throw new NotFoundException('User not found');
        }

        return {
            id: authUser.id,
            email: authUser.email,
            status: authUser.status,
            emailVerified: authUser.emailVerified,
            createdAt: authUser.createdAt,
        };
    }
    @Public()
    @Post('google-login')
    @HttpCode(HttpStatus.OK)
    async googleTokenLogin(
        @Body() googleTokenLoginDto: GoogleTokenLoginDto,
        @Ip() ipAddress: string,
        @UserAgent() userAgent: string,
    ) {
        return this.googleTokenLoginUseCase.execute(
            googleTokenLoginDto,
            ipAddress,
            userAgent,
        );
    }

    /**
     * ROUTE 1: Initier le flux OAuth Google
     * GET /auth/google
     */
    @Public()
    @Get('google')
    async googleAuth(@Res() res: Response) {
        const state = Math.random().toString(36).substring(7);
        const authorizationUrl = this.googleOAuthService.getAuthorizationUrl(state);
        return res.redirect(authorizationUrl);
    }

    /**
     * ROUTE 2: Callback OAuth Google
     * GET /auth/google/redirect?code=xxx&state=yyy
     */
    @Public()
    @Get('google/redirect')
    async googleAuthRedirect(
        @Query() query: GoogleOAuthCallbackDto,
        @Req() req: Request,
        @Res() res: Response,
        @Ip() ipAddress: string,
        @UserAgent() userAgent: string,
    ) {
        if (query.error) {
            throw new BadRequestException(
                `Google OAuth error: ${query.error_description || query.error}`,
            );
        }

        if (!query.code) {
            throw new BadRequestException('Authorization code is missing');
        }

        try {
            const googleTokens = await this.googleOAuthService.exchangeCodeForTokens(query.code);
            await this.googleTokenVerifier.verifyIdToken(googleTokens.id_token);

            const googleTokenLoginDto: GoogleTokenLoginDto = {
                idToken: googleTokens.id_token,
            };

            const authResponse = await this.googleTokenLoginUseCase.execute(
                googleTokenLoginDto,
                ipAddress,
                userAgent,
            );

            // Retourner JSON pour les clients SPA
            return res.json(authResponse);
        } catch (error) {
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            return res.redirect(`${frontendUrl}/auth/error?message=${encodeURIComponent(error.message)}`);
        }
    }

    @Public()
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
        return this.refreshTokenUseCase.execute(refreshTokenDto);
    }

    /**
     * Logout endpoint - CORRIGÉ: passe sessionId au lieu de userId
     */
    @Post('logout')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async logout(@Body() logoutDto: LogoutDto, @Req() req: Request) {
        // ✅ Type assertion pour accéder à userId
        const user = req.user as JwtPayloadExtended;

        if (!user?.userId) {
            throw new BadRequestException('User ID not found in request');
        }

        await this.logoutUseCase.execute(logoutDto, user.userId);

        return {
            success: true,
            message: 'Logged out successfully',
        };
    }


    @UseGuards(JwtAuthGuard)
    @Patch('change-password')
    @HttpCode(HttpStatus.OK)
    async changePassword(
        @CurrentUser() user: any,
        @Body() changePasswordDto: ChangePasswordDto,
    ) {
        await this.changePasswordUseCase.execute(user.userId, changePasswordDto);
        return { message: 'Password changed successfully' };
    }

    @Public()
    @Post('verify-email')
    @HttpCode(HttpStatus.OK)
    async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
        await this.verifyEmailUseCase.execute(verifyEmailDto);
        return { message: 'Email verified successfully' };
    }

    /**
     * ROUTE: Vérifier l'email via un lien cliquable
     * GET /auth/verify-email?code=ABC123
     */
    @Public()
    @Get('verify-email')
    async verifyEmailLink(
        @Query('code') code: string,
        @Res() res: Response,
    ) {
        if (!code) {
            return res.status(400).send(this.getErrorPage('Code de vérification manquant'));
        }

        try {
            const result = await this.verifyEmailByCodeUseCase.execute(code);
            return res.send(this.getSuccessPage(code, result.email));
        } catch (error) {
            return res.status(400).send(this.getErrorPage(error.message));
        }
    }

    /**
     * Retourne une page HTML de succès
     */
    private getSuccessPage(code: string, email?: string): string {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        return `
            <!DOCTYPE html>
            <html lang="fr">
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Email Vérifié - IMMO360</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
                    .container { background: white; border-radius: 12px; padding: 50px; text-align: center; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); max-width: 500px; width: 100%; }
                    .icon { font-size: 80px; margin-bottom: 20px; animation: scaleIn 0.5s ease-out; }
                    h1 { color: #1e3a8a; font-size: 28px; margin-bottom: 15px; }
                    p { color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 30px; }
                    .email { background-color: #f3f4f6; padding: 12px 20px; border-radius: 6px; font-family: monospace; color: #1e3a8a; font-weight: bold; margin: 20px 0; font-size: 14px; }
                    .code { background-color: #f3f4f6; padding: 12px 20px; border-radius: 6px; font-family: monospace; color: #1e3a8a; font-weight: bold; margin: 20px 0; font-size: 14px; }
                    .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 40px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; }
                    @keyframes scaleIn { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="icon">✓</div>
                    <h1>Email Vérifié !</h1>
                    <p>Votre adresse email a été vérifiée avec succès.</p>
                    <p>Vous pouvez maintenant vous connecter à IMMO360 avec votre compte.</p>
                    ${email ? `<div class="email"><strong>Email :</strong> ${email}</div>` : ''}
                    <div class="code">Code utilisé: ${code}</div>
                    <a href="${frontendUrl}/auth/login" class="button">Se connecter à IMMO360</a>
                </div>
            </body>
            </html>
        `;
    }

    /**
     * Retourne une page HTML d'erreur
     */
    private getErrorPage(message: string): string {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        return `
            <!DOCTYPE html>
            <html lang="fr">
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Erreur de Vérification - IMMO360</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
                    .container { background: white; border-radius: 12px; padding: 50px; text-align: center; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); max-width: 500px; width: 100%; }
                    .icon { font-size: 80px; margin-bottom: 20px; }
                    h1 { color: #dc2626; font-size: 28px; margin-bottom: 15px; }
                    p { color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 20px; }
                    .error-message { background-color: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; border-radius: 6px; color: #991b1b; margin: 20px 0; text-align: left; }
                    .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 40px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="icon">✗</div>
                    <h1>Erreur de Vérification</h1>
                    <p>Impossible de vérifier votre adresse email.</p>
                    <div class="error-message"><strong>Raison :</strong> ${message}</div>
                    <p>Veuillez contacter l'administrateur ou réessayer plus tard.</p>
                    <a href="${frontendUrl}/auth/login" class="button">Retour à la connexion</a>
                </div>
            </body>
            </html>
        `;
    }
}