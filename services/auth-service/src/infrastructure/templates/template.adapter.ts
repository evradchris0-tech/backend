// src/infrastructure/templates/template.adapter.ts

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface TemplateContext {
    [key: string]: string | number | boolean | undefined;
}

/**
 * Adaptateur pour le rendu des templates email
 * 
 * Pattern: Infrastructure Adapter
 * Responsabilité: Rendre les templates HTML avec substitution de variables
 * 
 * Note: Utilise une substitution simple {{variable}} pour éviter d'ajouter
 * une dépendance externe comme Handlebars.
 */
@Injectable()
export class TemplateAdapter {
    private readonly logger = new Logger(TemplateAdapter.name);
    private readonly frontendUrl: string;

    constructor(private readonly configService: ConfigService) {
        this.frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    }

    /**
     * Rend un template avec les variables de contexte
     */
    render(templateName: string, context: TemplateContext): string {
        const templates: Record<string, (ctx: TemplateContext) => string> = {
            'verification-email': this.getVerificationEmailTemplate.bind(this),
            'password-email': this.getPasswordEmailTemplate.bind(this),
            'password-reset-email': this.getPasswordResetEmailTemplate.bind(this),
        };

        const templateFn = templates[templateName];
        if (!templateFn) {
            this.logger.error(`Template not found: ${templateName}`);
            throw new Error(`Template '${templateName}' not found`);
        }

        return templateFn(context);
    }

    private getVerificationEmailTemplate(ctx: TemplateContext): string {
        const verificationUrl = `${this.frontendUrl}/auth/verify-email?code=${ctx.code}`;
        
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f3f4f6; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background-color: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden; }
        .header { background-color: #1e3a8a; color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 22px; letter-spacing: 0.5px; }
        .content { padding: 30px; }
        h2 { font-size: 20px; margin-top: 0; color: #111827; }
        .intro { margin-bottom: 25px; }
        .cta-button { display: inline-block; background-color: #1e3a8a; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 25px 0; text-align: center; }
        .info { font-size: 15px; color: #4b5563; }
        .footer { text-align: center; font-size: 12px; color: #6b7280; padding: 25px; background-color: #f9fafb; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>IMMO360 — Vérification de l'adresse email</h1>
        </div>
        <div class="content">
            <h2>Bonjour ${ctx.firstName},</h2>
            <p class="intro">
                Merci d'avoir créé un compte sur IMMO360.<br />
                Pour finaliser votre inscription, veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous :
            </p>
            <div style="text-align: center;">
                <a href="${verificationUrl}" class="cta-button">✓ Vérifier mon email</a>
            </div>
            <p style="text-align: center; margin-top: 20px; font-size: 14px; color: #6b7280;">
                Ou utilisez le code : <span style="font-family: monospace; font-weight: bold; background-color: #f3f4f6; padding: 4px 8px; border-radius: 4px;">${ctx.code}</span>
            </p>
            <p class="info">
                Ce lien expirera dans 24 heures.<br />
                Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer ce message.
            </p>
        </div>
        <div class="footer">
            IMMO360 — Gestion Intelligente des Infrastructures<br />
            Ce message est automatique.
        </div>
    </div>
</body>
</html>`;
    }

    private getPasswordEmailTemplate(ctx: TemplateContext): string {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f3f4f6; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background-color: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden; }
        .header { background-color: #1e3a8a; color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 22px; letter-spacing: 0.5px; }
        .content { padding: 30px; }
        h2 { font-size: 20px; margin-top: 0; color: #111827; }
        .credentials { background-color: #f9fafb; border-left: 4px solid #1e3a8a; padding: 20px; border-radius: 4px; margin-top: 25px; }
        .item { margin: 12px 0; }
        .label { font-weight: bold; color: #111827; }
        .value { margin-left: 5px; font-family: monospace; background-color: #e5e7eb; padding: 5px 8px; border-radius: 4px; }
        .note { background-color: #fff7ed; border-left: 4px solid #d97706; padding: 15px; border-radius: 4px; margin-top: 25px; color: #4b5563; }
        .link { color: #1e3a8a; text-decoration: none; font-weight: bold; }
        .footer { text-align: center; font-size: 12px; color: #6b7280; padding: 25px; background-color: #f9fafb; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>IMMO360 — Création de votre compte</h1>
        </div>
        <div class="content">
            <h2>Bonjour ${ctx.firstName} ${ctx.lastName},</h2>
            <p>Votre compte IMMO360 a été créé avec succès. Voici vos identifiants de connexion :</p>
            <div class="credentials">
                <div class="item"><span class="label">Email :</span> <span class="value">${ctx.email}</span></div>
                <div class="item"><span class="label">Mot de passe temporaire :</span> <span class="value">${ctx.password}</span></div>
                <div class="item"><span class="label">Rôle :</span> <span class="value">${ctx.role}</span></div>
            </div>
            <div class="note">
                Veuillez conserver ces informations en lieu sûr.
                Vous devrez vérifier votre adresse email avant votre première connexion.
            </div>
            <p style="margin-top:25px;">
                Accéder à IMMO360 : <a class="link" href="${this.frontendUrl}/login">Connexion</a>
            </p>
        </div>
        <div class="footer">
            IMMO360 — Gestion Intelligente des Infrastructures<br />
            Ce message a été généré automatiquement.
        </div>
    </div>
</body>
</html>`;
    }

    private getPasswordResetEmailTemplate(ctx: TemplateContext): string {
        const resetUrl = `${this.frontendUrl}/auth/reset-password?code=${ctx.code}`;
        
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f3f4f6; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background-color: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden; }
        .header { background-color: #d97706; color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 22px; letter-spacing: 0.5px; }
        .content { padding: 30px; }
        h2 { font-size: 20px; margin-top: 0; color: #111827; }
        .intro { margin-bottom: 25px; }
        .cta-button { display: inline-block; background-color: #d97706; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 25px 0; text-align: center; }
        .info { font-size: 15px; color: #4b5563; }
        .warning { background-color: #fef3c7; border-left: 4px solid #d97706; padding: 15px; border-radius: 4px; margin-top: 25px; color: #4b5563; }
        .footer { text-align: center; font-size: 12px; color: #6b7280; padding: 25px; background-color: #f9fafb; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>IMMO360 — Réinitialisation de mot de passe</h1>
        </div>
        <div class="content">
            <h2>Bonjour ${ctx.firstName},</h2>
            <p class="intro">
                Vous avez demandé la réinitialisation de votre mot de passe IMMO360.<br />
                Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe :
            </p>
            <div style="text-align: center;">
                <a href="${resetUrl}" class="cta-button">🔒 Réinitialiser mon mot de passe</a>
            </div>
            <p style="text-align: center; margin-top: 20px; font-size: 14px; color: #6b7280;">
                Ou utilisez le code : <span style="font-family: monospace; font-weight: bold; background-color: #f3f4f6; padding: 4px 8px; border-radius: 4px;">${ctx.code}</span>
            </p>
            <div class="warning">
                ⚠️ Ce lien expirera dans 1 heure.<br />
                Si vous n'avez pas demandé cette réinitialisation, ignorez ce message. Votre mot de passe restera inchangé.
            </div>
            <p class="info" style="margin-top: 25px;">
                Pour des raisons de sécurité, ne partagez jamais ce lien avec quiconque.
            </p>
        </div>
        <div class="footer">
            IMMO360 — Gestion Intelligente des Infrastructures<br />
            Ce message est automatique.
        </div>
    </div>
</body>
</html>`;
    }
}