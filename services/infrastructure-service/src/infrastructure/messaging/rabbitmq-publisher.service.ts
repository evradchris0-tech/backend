// src/infrastructure/messaging/rabbitmq-publisher.service.ts

import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    ClientProxy,
    ClientProxyFactory,
    Transport,
} from '@nestjs/microservices';
import { MESSAGE_PATTERNS, RABBITMQ_QUEUES } from '../config/rabbitmq.config';

/**
 * Service pour publier des messages vers RabbitMQ
 * Gere la communication sortante vers les autres microservices
 */
@Injectable()
export class RabbitMQPublisherService implements OnModuleDestroy {
    private readonly logger = new Logger(RabbitMQPublisherService.name);
    private clients: Map<string, ClientProxy> = new Map();

    constructor(private readonly configService: ConfigService) {
        this.initializeClients();
    }

    /**
     * Initialise les clients RabbitMQ pour chaque queue
     */
    private initializeClients(): void {
        const host = this.configService.get<string>('RABBITMQ_HOST', 'localhost');
        const port = this.configService.get<number>('RABBITMQ_PORT', 5672);
        const username = this.configService.get<string>('RABBITMQ_USERNAME', 'guest');
        const password = this.configService.get<string>('RABBITMQ_PASSWORD', 'guest');

        const url = `amqp://${username}:${password}@${host}:${port}`;

        // Creer un client pour chaque queue
        Object.values(RABBITMQ_QUEUES).forEach((queue) => {
            const client = ClientProxyFactory.create({
                transport: Transport.RMQ,
                options: {
                    urls: [url],
                    queue,
                    queueOptions: {
                        durable: true,
                    },
                },
            });

            this.clients.set(queue, client);
            this.logger.log(`Client RabbitMQ initialise pour la queue: ${queue}`);
        });
    }

    /**
     * Publie un evenement vers une queue specifique
     */
    async publish<T>(queue: string, pattern: string, data: T): Promise<void> {
        const client = this.clients.get(queue);

        if (!client) {
            this.logger.error(`Client non trouve pour la queue: ${queue}`);
            throw new Error(`Client non trouve pour la queue: ${queue}`);
        }

        try {
            client.emit(pattern, data);
            this.logger.debug(`Message publie - Queue: ${queue}, Pattern: ${pattern}`);
        } catch (error) {
            this.logger.error(
                `Erreur lors de la publication - Queue: ${queue}, Pattern: ${pattern}`,
                error,
            );
            throw error;
        }
    }

    /**
     * Envoie un message et attend une reponse (RPC)
     */
    async send<T, R>(queue: string, pattern: string, data: T): Promise<R> {
        const client = this.clients.get(queue);

        if (!client) {
            this.logger.error(`Client non trouve pour la queue: ${queue}`);
            throw new Error(`Client non trouve pour la queue: ${queue}`);
        }

        try {
            const result = await client.send<R, T>(pattern, data).toPromise();
            this.logger.debug(`Reponse recue - Queue: ${queue}, Pattern: ${pattern}`);
            return result as R;
        } catch (error) {
            this.logger.error(
                `Erreur lors de l'envoi RPC - Queue: ${queue}, Pattern: ${pattern}`,
                error,
            );
            throw error;
        }
    }

    /**
     * Publie un evenement de changement de statut d'equipement
     */
    async publishEquipementStatusChanged(data: {
        equipementId: string;
        ancienStatut: string;
        nouveauStatut: string;
        espaceId?: string;
        batimentId?: string;
        occurredAt: Date;
    }): Promise<void> {
        await this.publish(
            RABBITMQ_QUEUES.INCIDENT,
            MESSAGE_PATTERNS.EQUIPEMENT_STATUS_CHANGED,
            data,
        );

        // Notifier aussi le service de notification
        await this.publish(
            RABBITMQ_QUEUES.NOTIFICATION,
            MESSAGE_PATTERNS.EQUIPEMENT_STATUS_CHANGED,
            data,
        );
    }

    /**
     * Publie un evenement d'espace defectueux
     */
    async publishEspaceDefectueux(data: {
        espaceId: string;
        estDefectueux: boolean;
        nombreEquipementsDefectueux: number;
        batimentId?: string;
        etageId?: string;
        occurredAt: Date;
    }): Promise<void> {
        await this.publish(
            RABBITMQ_QUEUES.INCIDENT,
            MESSAGE_PATTERNS.ESPACE_DEFECTUEUX_CHANGED,
            data,
        );
    }

    /**
     * Publie un log d'audit
     */
    async publishAuditLog(data: {
        action: string;
        entityType: string;
        entityId: string;
        userId?: string;
        details?: Record<string, unknown>;
        occurredAt: Date;
    }): Promise<void> {
        await this.publish(RABBITMQ_QUEUES.AUDIT, MESSAGE_PATTERNS.AUDIT_LOG, data);
    }

    /**
     * Publie un evenement d'assignation d'occupant a un espace
     * Envoie vers user-service pour mettre a jour les donnees utilisateur
     */
    async publishEspaceOccupantAssigned(data: {
        espaceId: string;
        occupantId: string;
        dateDebut?: string;
        dateFin?: string;
        batimentId?: string;
        etageId?: string;
        nomEspace?: string;
        occurredAt: Date;
    }): Promise<void> {
        // Notifier le service utilisateur
        await this.publish(
            RABBITMQ_QUEUES.USER,
            MESSAGE_PATTERNS.ESPACE_OCCUPANT_ASSIGNED,
            data,
        );

        // Log d'audit
        await this.publishAuditLog({
            action: 'OCCUPANT_ASSIGNED',
            entityType: 'espace',
            entityId: data.espaceId,
            userId: data.occupantId,
            details: {
                dateDebut: data.dateDebut,
                dateFin: data.dateFin,
                batimentId: data.batimentId,
                etageId: data.etageId,
            },
            occurredAt: data.occurredAt,
        });

        this.logger.log(
            `Evenement ESPACE_OCCUPANT_ASSIGNED publie - Espace: ${data.espaceId}, Occupant: ${data.occupantId}`,
        );
    }

    /**
     * Publie un evenement de liberation d'un espace
     * Envoie vers user-service pour mettre a jour les donnees utilisateur
     */
    async publishEspaceLiberee(data: {
        espaceId: string;
        ancienOccupantId?: string;
        batimentId?: string;
        etageId?: string;
        nomEspace?: string;
        occurredAt: Date;
    }): Promise<void> {
        // Notifier le service utilisateur
        await this.publish(
            RABBITMQ_QUEUES.USER,
            MESSAGE_PATTERNS.ESPACE_LIBERATED,
            data,
        );

        // Log d'audit
        await this.publishAuditLog({
            action: 'ESPACE_LIBERATED',
            entityType: 'espace',
            entityId: data.espaceId,
            userId: data.ancienOccupantId,
            details: {
                batimentId: data.batimentId,
                etageId: data.etageId,
            },
            occurredAt: data.occurredAt,
        });

        this.logger.log(
            `Evenement ESPACE_LIBERATED publie - Espace: ${data.espaceId}`,
        );
    }

    /**
     * Publie un evenement d'assignation d'equipement
     */
    async publishEquipementAssigned(data: {
        equipementId: string;
        espaceId: string;
        responsableId?: string;
        typeEquipement: string;
        occurredAt: Date;
    }): Promise<void> {
        // Notifier le service utilisateur si un responsable est assigne
        if (data.responsableId) {
            await this.publish(
                RABBITMQ_QUEUES.USER,
                MESSAGE_PATTERNS.EQUIPEMENT_ASSIGNED,
                data,
            );
        }

        // Log d'audit
        await this.publishAuditLog({
            action: 'EQUIPEMENT_ASSIGNED',
            entityType: 'equipement',
            entityId: data.equipementId,
            userId: data.responsableId,
            details: {
                espaceId: data.espaceId,
                typeEquipement: data.typeEquipement,
            },
            occurredAt: data.occurredAt,
        });

        this.logger.log(
            `Evenement EQUIPEMENT_ASSIGNED publie - Equipement: ${data.equipementId}, Espace: ${data.espaceId}`,
        );
    }

    /**
     * Publie un evenement de creation de batiment
     */
    async publishBatimentCreated(data: {
        batimentId: string;
        nom: string;
        type: string;
        adresse?: string;
        occurredAt: Date;
    }): Promise<void> {
        // Notifier le service de notification
        await this.publish(
            RABBITMQ_QUEUES.NOTIFICATION,
            MESSAGE_PATTERNS.BATIMENT_CREATED,
            data,
        );

        // Log d'audit
        await this.publishAuditLog({
            action: 'BATIMENT_CREATED',
            entityType: 'batiment',
            entityId: data.batimentId,
            details: {
                nom: data.nom,
                type: data.type,
                adresse: data.adresse,
            },
            occurredAt: data.occurredAt,
        });

        this.logger.log(`Evenement BATIMENT_CREATED publie - Batiment: ${data.batimentId}`);
    }

    /**
     * Publie un evenement de suppression d'equipement
     */
    async publishEquipementRemoved(data: {
        equipementId: string;
        espaceId?: string;
        typeEquipement: string;
        occurredAt: Date;
    }): Promise<void> {
        await this.publish(
            RABBITMQ_QUEUES.NOTIFICATION,
            MESSAGE_PATTERNS.EQUIPEMENT_REMOVED,
            data,
        );

        // Log d'audit
        await this.publishAuditLog({
            action: 'EQUIPEMENT_REMOVED',
            entityType: 'equipement',
            entityId: data.equipementId,
            details: {
                espaceId: data.espaceId,
                typeEquipement: data.typeEquipement,
            },
            occurredAt: data.occurredAt,
        });

        this.logger.log(`Evenement EQUIPEMENT_REMOVED publie - Equipement: ${data.equipementId}`);
    }

    // ============================================
    // Publication vers equipement-service
    // ============================================

    /**
     * Notifie equipement-service quand un equipement est assigne a un espace
     * Permet de synchroniser la localisation dans le service equipement
     */
    async publishEquipementAssignedToEspace(data: {
        equipementId: string;
        espaceId: string;
        batimentId?: string;
        etageId?: string;
        nomEspace?: string;
        nomBatiment?: string;
        occurredAt: Date;
    }): Promise<void> {
        await this.publish(
            RABBITMQ_QUEUES.EQUIPEMENT,
            MESSAGE_PATTERNS.EQUIPEMENT_ASSIGNED_TO_ESPACE,
            data,
        );

        this.logger.log(
            `Evenement EQUIPEMENT_ASSIGNED_TO_ESPACE publie vers equipement-service - ` +
            `Equipement: ${data.equipementId}, Espace: ${data.espaceId}`,
        );
    }

    /**
     * Notifie equipement-service quand un equipement est retire d'un espace
     */
    async publishEquipementRemovedFromEspace(data: {
        equipementId: string;
        ancienEspaceId: string;
        motif?: string;
        occurredAt: Date;
    }): Promise<void> {
        await this.publish(
            RABBITMQ_QUEUES.EQUIPEMENT,
            MESSAGE_PATTERNS.EQUIPEMENT_REMOVED_FROM_ESPACE,
            data,
        );

        this.logger.log(
            `Evenement EQUIPEMENT_REMOVED_FROM_ESPACE publie vers equipement-service - ` +
            `Equipement: ${data.equipementId}`,
        );
    }

    /**
     * Notifie equipement-service d'un changement de statut
     * (panne, maintenance, etc.)
     */
    async publishEquipementStatusChangedToEquipementService(data: {
        equipementId: string;
        ancienStatut: string;
        nouveauStatut: string;
        espaceId?: string;
        motif?: string;
        occurredAt: Date;
    }): Promise<void> {
        await this.publish(
            RABBITMQ_QUEUES.EQUIPEMENT,
            MESSAGE_PATTERNS.EQUIPEMENT_STATUS_CHANGED,
            data,
        );

        this.logger.log(
            `Evenement EQUIPEMENT_STATUS_CHANGED publie vers equipement-service - ` +
            `Equipement: ${data.equipementId}, ${data.ancienStatut} -> ${data.nouveauStatut}`,
        );
    }

    /**
     * Notifie equipement-service de la creation d'un nouvel espace
     * Utile pour que equipement-service connaisse les localisations disponibles
     */
    async publishEspaceCreated(data: {
        espaceId: string;
        numero: string;
        type: string;
        etageId: string;
        batimentId: string;
        nomBatiment: string;
        occurredAt: Date;
    }): Promise<void> {
        await this.publish(
            RABBITMQ_QUEUES.EQUIPEMENT,
            MESSAGE_PATTERNS.ESPACE_CREATED,
            data,
        );

        this.logger.log(
            `Evenement ESPACE_CREATED publie vers equipement-service - Espace: ${data.espaceId}`,
        );
    }

    /**
     * Nettoyage des connexions lors de la destruction du module
     */
    async onModuleDestroy(): Promise<void> {
        for (const [queue, client] of this.clients) {
            try {
                await client.close();
                this.logger.log(`Client RabbitMQ ferme pour la queue: ${queue}`);
            } catch (error) {
                this.logger.error(
                    `Erreur lors de la fermeture du client pour la queue: ${queue}`,
                    error,
                );
            }
        }
    }
}
