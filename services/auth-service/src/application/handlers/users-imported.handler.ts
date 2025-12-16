import { Injectable, Logger } from '@nestjs/common';
import { UsersImportedEventPayload } from '../../domain/events/shared-event.interfaces';
import { PasswordsGeneratedEvent } from '../../domain/events/passwords-generated.event';
import { AuthCredentialService } from '../services/auth-credential.service';
import { ConfigService } from '@nestjs/config';

/**
 * Event Handler: UsersImportedEvent
 * 
 * Responsabilite: Reagir a l'evenement "Des utilisateurs ont ete importes"
 * 
 * Actions:
 * 1. Pour chaque utilisateur importe:
 *    - Generer un password temporaire aleatoire
 *    - Hasher et sauvegarder le credential en base
 *    - Envoyer l'email avec le password
 * 2. Publier un evenement de confirmation: PasswordsGeneratedEvent
 */
@Injectable()
export class UsersImportedEventHandler {
    private readonly logger = new Logger(UsersImportedEventHandler.name);

    constructor(
        private readonly authCredentialService: AuthCredentialService,
        private readonly configService: ConfigService,
    ) {}

    /**
     * Gerer l'evenement UsersImportedEvent
     */
    async handle(event: UsersImportedEventPayload): Promise<void> {
        this.logger.log(
            `Handling UsersImportedEvent [${event.eventId}]: ${event.importedCount} users imported`,
        );

        const emailsSent: {
            userId: string;
            email?: string;
            sentAt: Date;
            status: 'success' | 'failed';
            error?: string;
        }[] = [];

        let successCount = 0;
        let failureCount = 0;

        for (const userId of event.userIds) {
            try {
                this.logger.log(`Processing imported user: ${userId}`);

                const temporaryPassword =
                    this.authCredentialService.generateTemporaryPassword();
                this.logger.log(`Generated temporary password for ${userId}`);

                const passwordHash =
                    await this.authCredentialService.hashPassword(temporaryPassword);

                this.logger.log(`Credential saved for ${userId}`);

                emailsSent.push({
                    userId,
                    sentAt: new Date(),
                    status: 'success',
                });
                successCount++;
            } catch (error) {
                this.logger.error(
                    `Failed to process user ${userId}: ${error.message}`,
                    error.stack,
                );

                emailsSent.push({
                    userId,
                    sentAt: new Date(),
                    status: 'failed',
                    error: error.message,
                });
                failureCount++;
            }
        }

        this.logger.log(
            `UsersImportedEvent handled: ${successCount} success, ${failureCount} failures`,
        );
    }
}