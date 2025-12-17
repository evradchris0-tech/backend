import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { firstValueFrom, timeout, catchError, of } from 'rxjs';
import { RABBITMQ_QUEUES, MESSAGE_PATTERNS } from '../config/rabbitmq-exchanges.config';

/**
 * Interface pour la réponse de localisation
 */
export interface LocalisationCompleteDto {
  espaceId: string;
  numero: string;
  type: string;
  etageId: string;
  etageNumero: number;
  etageDesignation?: string;
  batimentId: string;
  batimentNom: string;
  batimentCode?: string;
  batimentType?: string;
}

/**
 * Interface pour la réponse d'espace
 */
export interface EspaceInfoDto {
  id: string;
  numero: string;
  type: string;
  superficie?: number;
  capacite?: number;
  estOccupe: boolean;
  occupantId?: string;
  aEquipementDefectueux: boolean;
  nombreEquipementsDefectueux: number;
  etageId: string;
}

/**
 * Client RPC pour communiquer avec infrastructure-service
 * Permet de valider et récupérer des informations sur les espaces
 */
@Injectable()
export class InfrastructureRpcClientService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(InfrastructureRpcClientService.name);
  private client: ClientProxy;
  private readonly DEFAULT_TIMEOUT = 5000; // 5 secondes

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    try {
      const host = this.configService.get<string>('RABBITMQ_HOST', 'localhost');
      const port = this.configService.get<number>('RABBITMQ_PORT', 5672);
      const username = this.configService.get<string>('RABBITMQ_USERNAME', 'guest');
      const password = this.configService.get<string>('RABBITMQ_PASSWORD', 'guest');

      const url = `amqp://${username}:${password}@${host}:${port}`;

      this.client = ClientProxyFactory.create({
        transport: Transport.RMQ,
        options: {
          urls: [url],
          queue: RABBITMQ_QUEUES.INFRASTRUCTURE_QUEUE,
          queueOptions: {
            durable: true,
          },
        },
      });

      await this.client.connect();
      this.logger.log('✅ Infrastructure RPC Client connected');
    } catch (error) {
      this.logger.error('❌ Failed to connect Infrastructure RPC Client', error);
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.client?.close();
      this.logger.log('Infrastructure RPC Client disconnected');
    } catch (error) {
      this.logger.error('Error closing Infrastructure RPC Client', error);
    }
  }

  /**
   * Valide qu'un espace existe dans infrastructure-service
   */
  async validateEspaceExists(espaceId: string): Promise<boolean> {
    try {
      this.logger.debug(`Validating espace exists: ${espaceId}`);

      const result = await firstValueFrom(
        this.client
          .send<boolean>(MESSAGE_PATTERNS.VALIDATE_ESPACE_EXISTS, { espaceId })
          .pipe(
            timeout(this.DEFAULT_TIMEOUT),
            catchError((error) => {
              this.logger.error(`RPC Error validating espace: ${error.message}`);
              return of(false);
            }),
          ),
      );

      this.logger.debug(`Espace ${espaceId} exists: ${result}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to validate espace ${espaceId}:`, error);
      return false;
    }
  }

  /**
   * Récupère les informations d'un espace
   */
  async getEspaceById(espaceId: string): Promise<EspaceInfoDto | null> {
    try {
      this.logger.debug(`Getting espace info: ${espaceId}`);

      const result = await firstValueFrom(
        this.client
          .send<EspaceInfoDto | null>(MESSAGE_PATTERNS.GET_ESPACE_BY_ID, { espaceId })
          .pipe(
            timeout(this.DEFAULT_TIMEOUT),
            catchError((error) => {
              this.logger.error(`RPC Error getting espace: ${error.message}`);
              return of(null);
            }),
          ),
      );

      return result;
    } catch (error) {
      this.logger.error(`Failed to get espace ${espaceId}:`, error);
      return null;
    }
  }

  /**
   * Récupère la localisation complète d'un espace
   * (Bâtiment -> Étage -> Espace)
   */
  async getLocalisationComplete(espaceId: string): Promise<LocalisationCompleteDto | null> {
    try {
      this.logger.debug(`Getting localisation complete: ${espaceId}`);

      const result = await firstValueFrom(
        this.client
          .send<LocalisationCompleteDto | null>(
            MESSAGE_PATTERNS.GET_LOCALISATION_COMPLETE,
            { espaceId },
          )
          .pipe(
            timeout(this.DEFAULT_TIMEOUT),
            catchError((error) => {
              this.logger.error(`RPC Error getting localisation: ${error.message}`);
              return of(null);
            }),
          ),
      );

      return result;
    } catch (error) {
      this.logger.error(`Failed to get localisation for espace ${espaceId}:`, error);
      return null;
    }
  }

  /**
   * Valide un espace et retourne ses informations de localisation si valide
   * Méthode combinée pour optimiser les appels RPC
   */
  async validateAndGetLocalisation(
    espaceId: string,
  ): Promise<{ valid: boolean; localisation: LocalisationCompleteDto | null }> {
    const localisation = await this.getLocalisationComplete(espaceId);

    return {
      valid: localisation !== null,
      localisation,
    };
  }

  /**
   * Vérifie si un espace peut recevoir un équipement
   * (existe, n'est pas plein, etc.)
   */
  async canAssignEquipementToEspace(espaceId: string): Promise<{
    canAssign: boolean;
    reason?: string;
    espace?: EspaceInfoDto;
  }> {
    const espace = await this.getEspaceById(espaceId);

    if (!espace) {
      return {
        canAssign: false,
        reason: `Espace avec l'ID '${espaceId}' non trouvé`,
      };
    }

    // Vérifications métier additionnelles possibles:
    // - L'espace n'est pas trop encombré
    // - L'espace accepte ce type d'équipement
    // etc.

    return {
      canAssign: true,
      espace,
    };
  }
}
