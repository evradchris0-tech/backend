// src/infrastructure/config/rabbitmq.config.ts

import { ConfigService } from '@nestjs/config';
import { RmqOptions, Transport } from '@nestjs/microservices';

/**
 * Configuration RabbitMQ pour la communication inter-services
 */
export const getRabbitMQConfig = (configService: ConfigService): RmqOptions => {
    const host = configService.get<string>('RABBITMQ_HOST', 'localhost');
    const port = configService.get<number>('RABBITMQ_PORT', 5672);
    const username = configService.get<string>('RABBITMQ_USERNAME', 'guest');
    const password = configService.get<string>('RABBITMQ_PASSWORD', 'guest');
    const queue = configService.get<string>('RABBITMQ_QUEUE', 'infrastructure_queue');

    return {
        transport: Transport.RMQ,
        options: {
            urls: [`amqp://${username}:${password}@${host}:${port}`],
            queue,
            queueOptions: {
                durable: true,
            },
            prefetchCount: 1,
            noAck: false,
            persistent: true,
        },
    };
};

/**
 * Noms des queues utilisees par le service
 */
export const RABBITMQ_QUEUES = {
    INFRASTRUCTURE: 'infrastructure_queue',
    EQUIPEMENT: 'equipement_queue',
    INCIDENT: 'incident_queue',
    NOTIFICATION: 'notification_queue',
    USER: 'user_queue',
    AUDIT: 'audit_queue',
} as const;

/**
 * Patterns de messages pour la communication inter-services
 */
export const MESSAGE_PATTERNS = {
    // ============================================
    // Evenements emis par infrastructure-service
    // ============================================

    // Equipements dans les espaces
    EQUIPEMENT_STATUS_CHANGED: 'equipement.status.changed',
    EQUIPEMENT_ASSIGNED_TO_ESPACE: 'equipement.assigned.to.espace',
    EQUIPEMENT_REMOVED_FROM_ESPACE: 'equipement.removed.from.espace',
    EQUIPEMENT_ASSIGNED: 'equipement.assigned',
    EQUIPEMENT_REMOVED: 'equipement.removed',

    // Espaces
    ESPACE_DEFECTUEUX_CHANGED: 'espace.defectueux.changed',
    ESPACE_OCCUPANT_ASSIGNED: 'espace.occupant.assigned',
    ESPACE_LIBERATED: 'espace.liberated',
    ESPACE_CREATED: 'espace.created',
    ESPACE_UPDATED: 'espace.updated',
    ESPACE_DELETED: 'espace.deleted',

    // Batiments
    BATIMENT_CREATED: 'batiment.created',
    BATIMENT_UPDATED: 'batiment.updated',

    // ============================================
    // Evenements recus depuis equipement-service
    // ============================================

    // Affectations depuis le stock
    EQUIPEMENT_AFFECTE_DEPUIS_STOCK: 'equipement.affecte.depuis.stock',
    EQUIPEMENT_RETOURNE_AU_STOCK: 'equipement.retourne.au.stock',

    // Stock et maintenance
    EQUIPEMENT_STOCK_FAIBLE: 'equipement.stock.faible',
    EQUIPEMENT_PANNE_ENREGISTREE: 'equipement.panne.enregistree',
    EQUIPEMENT_MAINTENANCE_TERMINEE: 'equipement.maintenance.terminee',

    // ============================================
    // Commandes RPC (requete/reponse)
    // ============================================

    // Recues par infrastructure-service
    GET_ESPACE_BY_ID: 'infrastructure.espace.get',
    GET_EQUIPEMENT_BY_ID: 'infrastructure.equipement.get',
    GET_EQUIPEMENTS_BY_ESPACE: 'infrastructure.equipements.by_espace',
    GET_LOCALISATION_COMPLETE: 'infrastructure.localisation.get',
    VALIDATE_ESPACE_EXISTS: 'infrastructure.espace.validate',
    VALIDATE_EQUIPEMENT_EXISTS: 'infrastructure.equipement.validate',

    // Envoyees vers equipement-service
    GET_EQUIPEMENT_STOCK_INFO: 'equipement.stock.info.get',
    NOTIFY_EQUIPEMENT_LOCALISATION: 'equipement.localisation.notify',

    // Audit
    AUDIT_LOG: 'audit.log',
} as const;

/**
 * Noms des exchanges pour communication via topic routing
 */
export const RABBITMQ_EXCHANGES = {
    INFRASTRUCTURE_EVENTS: 'infrastructure.events',
    EQUIPEMENT_EVENTS: 'equipement.events',
    USER_EVENTS: 'user.events',
} as const;

export type MessagePattern = typeof MESSAGE_PATTERNS[keyof typeof MESSAGE_PATTERNS];