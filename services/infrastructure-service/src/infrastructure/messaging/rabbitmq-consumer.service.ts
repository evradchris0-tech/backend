// src/infrastructure/messaging/rabbitmq-consumer.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { MessagePattern, Payload, Ctx, RmqContext, EventPattern } from '@nestjs/microservices';
import { MESSAGE_PATTERNS } from '../config/rabbitmq.config';
import { BatimentService } from '../../application/services/batiment.service';
import { EspaceService } from '../../application/services/espace.service';
import { EquipementService } from '../../application/services/equipement.service';
import { TypeEquipement, StatutEquipement } from '../../domain/enums';
import { RabbitMQPublisherService } from './rabbitmq-publisher.service';

/**
 * Interface pour les événements reçus depuis equipement-service
 */
interface EquipementServiceEvent {
    eventName: string;
    occurredOn: string;
    aggregateId: string;
    payload: Record<string, unknown>;
    metadata?: {
        service: string;
        timestamp: string;
    };
}

/**
 * Service consommateur RabbitMQ
 * Gere les messages entrants des autres microservices
 */
@Injectable()
export class RabbitMQConsumerService {
    private readonly logger = new Logger(RabbitMQConsumerService.name);

    constructor(
        private readonly batimentService: BatimentService,
        private readonly espaceService: EspaceService,
        private readonly equipementService: EquipementService,
        private readonly rabbitMQPublisher: RabbitMQPublisherService,
    ) {}

    /**
     * Recupere un espace par son ID
     * Utilise par les autres services pour valider l'existence d'un espace
     */
    @MessagePattern(MESSAGE_PATTERNS.GET_ESPACE_BY_ID)
    async getEspaceById(
        @Payload() data: { espaceId: string },
        @Ctx() context: RmqContext,
    ): Promise<unknown> {
        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();

        try {
            this.logger.debug(`Requete GET_ESPACE_BY_ID: ${data.espaceId}`);
            const espace = await this.espaceService.findById(data.espaceId);
            channel.ack(originalMsg);
            return espace;
        } catch (error) {
            this.logger.error(`Erreur GET_ESPACE_BY_ID: ${error}`);
            channel.ack(originalMsg);
            return null;
        }
    }

    /**
     * Recupere un equipement par son ID
     */
    @MessagePattern(MESSAGE_PATTERNS.GET_EQUIPEMENT_BY_ID)
    async getEquipementById(
        @Payload() data: { equipementId: string },
        @Ctx() context: RmqContext,
    ): Promise<unknown> {
        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();

        try {
            this.logger.debug(`Requete GET_EQUIPEMENT_BY_ID: ${data.equipementId}`);
            const equipement = await this.equipementService.findById(data.equipementId);
            channel.ack(originalMsg);
            return equipement;
        } catch (error) {
            this.logger.error(`Erreur GET_EQUIPEMENT_BY_ID: ${error}`);
            channel.ack(originalMsg);
            return null;
        }
    }

    /**
     * Recupere les equipements d'un espace
     */
    @MessagePattern(MESSAGE_PATTERNS.GET_EQUIPEMENTS_BY_ESPACE)
    async getEquipementsByEspace(
        @Payload() data: { espaceId: string },
        @Ctx() context: RmqContext,
    ): Promise<unknown> {
        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();

        try {
            this.logger.debug(`Requete GET_EQUIPEMENTS_BY_ESPACE: ${data.espaceId}`);
            const equipements = await this.equipementService.findByEspace(data.espaceId);
            channel.ack(originalMsg);
            return equipements;
        } catch (error) {
            this.logger.error(`Erreur GET_EQUIPEMENTS_BY_ESPACE: ${error}`);
            channel.ack(originalMsg);
            return [];
        }
    }

    /**
     * Recupere la localisation complete d'un espace
     * (Batiment -> Etage -> Espace)
     */
    @MessagePattern(MESSAGE_PATTERNS.GET_LOCALISATION_COMPLETE)
    async getLocalisationComplete(
        @Payload() data: { espaceId: string },
        @Ctx() context: RmqContext,
    ): Promise<unknown> {
        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();

        try {
            this.logger.debug(`Requete GET_LOCALISATION_COMPLETE: ${data.espaceId}`);
            const espace = await this.espaceService.findByIdWithLocalisation(data.espaceId);

            if (!espace) {
                channel.ack(originalMsg);
                return null;
            }

            channel.ack(originalMsg);
            return espace;
        } catch (error) {
            this.logger.error(`Erreur GET_LOCALISATION_COMPLETE: ${error}`);
            channel.ack(originalMsg);
            return null;
        }
    }

    /**
     * Valide l'existence d'un espace
     */
    @MessagePattern(MESSAGE_PATTERNS.VALIDATE_ESPACE_EXISTS)
    async validateEspaceExists(
        @Payload() data: { espaceId: string },
        @Ctx() context: RmqContext,
    ): Promise<boolean> {
        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();

        try {
            this.logger.debug(`Requete VALIDATE_ESPACE_EXISTS: ${data.espaceId}`);
            const espace = await this.espaceService.findById(data.espaceId);
            const exists = espace !== null;
            channel.ack(originalMsg);
            return exists;
        } catch (error) {
            this.logger.error(`Erreur VALIDATE_ESPACE_EXISTS: ${error}`);
            channel.ack(originalMsg);
            return false;
        }
    }

    /**
     * Valide l'existence d'un equipement
     */
    @MessagePattern(MESSAGE_PATTERNS.VALIDATE_EQUIPEMENT_EXISTS)
    async validateEquipementExists(
        @Payload() data: { equipementId: string },
        @Ctx() context: RmqContext,
    ): Promise<boolean> {
        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();

        try {
            this.logger.debug(`Requete VALIDATE_EQUIPEMENT_EXISTS: ${data.equipementId}`);
            let exists = false;
            try {
                await this.equipementService.findById(data.equipementId);
                exists = true;
            } catch {
                exists = false;
            }
            channel.ack(originalMsg);
            return exists;
        } catch (error) {
            this.logger.error(`Erreur VALIDATE_EQUIPEMENT_EXISTS: ${error}`);
            channel.ack(originalMsg);
            return false;
        }
    }

    // ============================================
    // Handlers pour evenements depuis equipement-service
    // ============================================

    /**
     * Recoit un evenement quand un equipement est affecte depuis le stock (equipement-service)
     * Cree ou met a jour l'equipement dans l'espace correspondant
     */
    @MessagePattern(MESSAGE_PATTERNS.EQUIPEMENT_AFFECTE_DEPUIS_STOCK)
    async handleEquipementAffecteDepuisStock(
        @Payload() data: EquipementServiceEvent | {
            equipementId: string;
            reference: string;
            designation?: string;
            type: string;
            typeEquipement?: string;
            espaceId: string;
            quantite: number;
            affectationId: string;
            dateAffectation: string;
            serviceBeneficiaire?: string;
            utilisateurBeneficiaire?: string;
        },
        @Ctx() context: RmqContext,
    ): Promise<void> {
        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();

        try {
            // Extraire les données selon le format (événement ou direct)
            const payload = 'payload' in data ? data.payload : data;
            const equipementId = payload.equipementId as string || (data as EquipementServiceEvent).aggregateId;
            const espaceId = payload.espaceId as string;
            const typeEquipement = (payload.typeEquipement || payload.type) as string;
            const reference = payload.reference as string;
            const designation = payload.designation as string;

            this.logger.log(
                `📥 Evenement EQUIPEMENT_AFFECTE_DEPUIS_STOCK recu - ` +
                `Equipement: ${equipementId}, Type: ${typeEquipement}, Espace: ${espaceId}`,
            );

            // Verifier que l'espace existe
            const espace = await this.espaceService.findByIdWithLocalisation(espaceId);
            if (!espace) {
                this.logger.warn(`⚠️ Espace ${espaceId} non trouve pour affectation equipement`);
                channel.ack(originalMsg);
                return;
            }

            // Mapper le type d'equipement du stock vers infrastructure
            const mappedType = this.mapTypeEquipementFromStock(typeEquipement);
            if (!mappedType) {
                this.logger.warn(`⚠️ Type d'equipement non mappable: ${typeEquipement}`);
                channel.ack(originalMsg);
                return;
            }

            // Creer l'equipement dans infrastructure-service
            try {
                const createDto = {
                    type: mappedType,
                    espaceId,
                    marque: reference || undefined,
                    modele: designation || undefined,
                    numeroSerie: `STOCK-${equipementId}`,
                    dateAcquisition: payload.dateAffectation as string,
                    description: `Equipement affecte depuis le stock - Ref: ${reference || equipementId}`,
                };

                const createdEquipement = await this.equipementService.create(createDto);

                this.logger.log(
                    `✅ Equipement cree dans infrastructure - ID: ${createdEquipement.id}, ` +
                    `Type: ${mappedType}, Espace: ${espaceId}`,
                );

                // Notifier equipement-service de la localisation
                await this.rabbitMQPublisher.publishEquipementAssignedToEspace({
                    equipementId,
                    espaceId,
                    batimentId: espace.localisation?.batimentId,
                    etageId: espace.localisation?.etageId,
                    nomEspace: espace.numero,
                    nomBatiment: espace.localisation?.batimentNom,
                    occurredAt: new Date(),
                });
            } catch (createError) {
                this.logger.error(`Erreur creation equipement: ${createError}`);
            }

            channel.ack(originalMsg);
        } catch (error) {
            this.logger.error(`❌ Erreur EQUIPEMENT_AFFECTE_DEPUIS_STOCK: ${error}`);
            channel.ack(originalMsg);
        }
    }

    /**
     * Mappe les types d'equipement du stock vers les types infrastructure
     */
    private mapTypeEquipementFromStock(stockType: string): TypeEquipement | null {
        const mapping: Record<string, TypeEquipement> = {
            // Equipements de chambre
            'LIT': TypeEquipement.LIT,
            'MATELAS': TypeEquipement.MATELAS,
            'ARMOIRE': TypeEquipement.ARMOIRE,
            'TABLE': TypeEquipement.TABLE,
            'CHAISE': TypeEquipement.CHAISE,
            'BUREAU': TypeEquipement.BUREAU,
            // Electromenager
            'CLIMATISEUR': TypeEquipement.CLIMATISEUR,
            'VENTILATEUR': TypeEquipement.VENTILATEUR,
            'REFRIGERATEUR': TypeEquipement.REFRIGERATEUR,
            'CHAUFFE_EAU': TypeEquipement.CHAUFFE_EAU,
            // Sanitaire
            'LAVABO': TypeEquipement.LAVABO,
            'DOUCHE': TypeEquipement.DOUCHE,
            'WC': TypeEquipement.WC,
            // Electricite
            'PRISE': TypeEquipement.PRISE_ELECTRIQUE,
            'PRISE_ELECTRIQUE': TypeEquipement.PRISE_ELECTRIQUE,
            'INTERRUPTEUR': TypeEquipement.INTERRUPTEUR,
            'ECLAIRAGE': TypeEquipement.ECLAIRAGE,
            'LAMPE': TypeEquipement.ECLAIRAGE,
            // Multimedia/Informatique
            'TELEVISEUR': TypeEquipement.TELEVISEUR,
            'TV': TypeEquipement.TELEVISEUR,
            'ORDINATEUR': TypeEquipement.ORDINATEUR,
            'PROJECTEUR': TypeEquipement.PROJECTEUR,
            'VIDEOPROJECTEUR': TypeEquipement.PROJECTEUR,
            // Securite
            'EXTINCTEUR': TypeEquipement.EXTINCTEUR,
            'DETECTEUR_FUMEE': TypeEquipement.DETECTEUR_FUMEE,
            // Divers
            'RIDEAU': TypeEquipement.RIDEAU,
            'MIROIR': TypeEquipement.MIROIR,
        };

        return mapping[stockType?.toUpperCase()] || null;
    }

    /**
     * Recoit un evenement quand un equipement est retourne au stock
     * Met a jour ou supprime l'equipement de l'espace
     */
    @MessagePattern(MESSAGE_PATTERNS.EQUIPEMENT_RETOURNE_AU_STOCK)
    async handleEquipementRetourneAuStock(
        @Payload() data: EquipementServiceEvent | {
            equipementId: string;
            reference?: string;
            espaceId: string;
            affectationId: string;
            etat: string;
            quantite?: number;
            dateRetour: string;
            motif?: string;
        },
        @Ctx() context: RmqContext,
    ): Promise<void> {
        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();

        try {
            const payload = 'payload' in data ? data.payload : data;
            const equipementId = payload.equipementId as string || (data as EquipementServiceEvent).aggregateId;
            const espaceId = payload.espaceId as string;
            const etat = payload.etat as string;
            const motif = payload.motif as string;

            this.logger.log(
                `📥 Evenement EQUIPEMENT_RETOURNE_AU_STOCK recu - ` +
                `Equipement: ${equipementId}, Espace: ${espaceId}, Etat: ${etat}`,
            );

            // Rechercher l'equipement par numero de serie (qui contient l'ID stock)
            const numeroSerieRecherche = `STOCK-${equipementId}`;

            // Traiter selon l'état du retour
            switch (etat?.toUpperCase()) {
                case 'RETOURNEE':
                    // Equipement retourne en bon etat - on peut le retirer de l'espace
                    this.logger.log(`✅ Equipement ${equipementId} retourne en bon etat`);
                    // Optionnel: desactiver ou retirer l'equipement de l'espace
                    break;

                case 'PERDUE':
                    // Equipement perdu - marquer comme hors service
                    this.logger.warn(`⚠️ Equipement ${equipementId} declare PERDU`);
                    break;

                case 'ENDOMMAGEE':
                    // Equipement endommage - marquer pour reparation
                    this.logger.warn(`⚠️ Equipement ${equipementId} retourne ENDOMMAGE - Motif: ${motif}`);
                    break;

                default:
                    this.logger.debug(`Etat de retour non gere: ${etat}`);
            }

            // Notifier equipement-service
            await this.rabbitMQPublisher.publishEquipementRemovedFromEspace({
                equipementId,
                ancienEspaceId: espaceId,
                motif: motif || `Retour au stock - Etat: ${etat}`,
                occurredAt: new Date(),
            });

            this.logger.log(
                `✅ Retour equipement ${equipementId} depuis espace ${espaceId} traite`,
            );

            channel.ack(originalMsg);
        } catch (error) {
            this.logger.error(`❌ Erreur EQUIPEMENT_RETOURNE_AU_STOCK: ${error}`);
            channel.ack(originalMsg);
        }
    }

    /**
     * Recoit une alerte de stock faible
     * Peut etre utilise pour planifier des commandes et alerter les gestionnaires
     */
    @MessagePattern(MESSAGE_PATTERNS.EQUIPEMENT_STOCK_FAIBLE)
    async handleStockFaible(
        @Payload() data: EquipementServiceEvent | {
            equipementId: string;
            reference: string;
            designation?: string;
            type: string;
            typeEquipement?: string;
            categorieId?: string;
            quantiteRestante?: number;
            quantiteActuelle?: number;
            quantiteMinimale?: number;
            seuilAlerte?: number;
            seuilCritique?: boolean;
        },
        @Ctx() context: RmqContext,
    ): Promise<void> {
        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();

        try {
            const payload = 'payload' in data ? data.payload : data;
            const reference = payload.reference as string;
            const designation = payload.designation as string;
            const typeEquipement = (payload.typeEquipement || payload.type) as string;
            const quantiteActuelle = (payload.quantiteActuelle || payload.quantiteRestante) as number;
            const quantiteMinimale = (payload.quantiteMinimale || payload.seuilAlerte) as number;
            const seuilCritique = payload.seuilCritique as boolean;

            const alertLevel = seuilCritique ? '🔴 CRITIQUE' : '🟠 FAIBLE';

            this.logger.warn(
                `${alertLevel} ALERTE STOCK - Type: ${typeEquipement}, ` +
                `Reference: ${reference || designation}, ` +
                `Quantite: ${quantiteActuelle}/${quantiteMinimale}`,
            );

            // Emettre un evenement interne pour le dashboard et les notifications
            // Cette alerte peut declencher:
            // - Notification aux gestionnaires d'infrastructure
            // - Mise en evidence dans le dashboard
            // - Blocage de nouvelles affectations si critique

            channel.ack(originalMsg);
        } catch (error) {
            this.logger.error(`❌ Erreur EQUIPEMENT_STOCK_FAIBLE: ${error}`);
            channel.ack(originalMsg);
        }
    }

    /**
     * Recoit un evenement de panne enregistree sur un equipement depuis le stock
     * Met a jour le statut de l'equipement dans l'espace correspondant
     */
    @MessagePattern(MESSAGE_PATTERNS.EQUIPEMENT_PANNE_ENREGISTREE)
    async handlePanneEnregistree(
        @Payload() data: EquipementServiceEvent | {
            equipementId: string;
            reference?: string;
            designation?: string;
            espaceId?: string;
            description: string;
            typePanne?: string;
            datePanne: string;
            nombrePannesTotal?: number;
        },
        @Ctx() context: RmqContext,
    ): Promise<void> {
        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();

        try {
            const payload = 'payload' in data ? data.payload : data;
            const equipementId = payload.equipementId as string || (data as EquipementServiceEvent).aggregateId;
            const espaceId = payload.espaceId as string;
            const description = payload.description as string;
            const nombrePannes = payload.nombrePannesTotal as number;

            this.logger.log(
                `📥 Evenement PANNE_ENREGISTREE recu - Equipement: ${equipementId}, ` +
                `Description: ${description?.substring(0, 50)}...`,
            );

            // Si un espaceId est fourni, mettre a jour l'equipement dans cet espace
            if (espaceId) {
                try {
                    // Rechercher les equipements de l'espace et mettre a jour le statut
                    const equipements = await this.equipementService.findByEspace(espaceId);

                    // Trouver l'equipement correspondant par numero de serie
                    const numeroSerieRecherche = `STOCK-${equipementId}`;
                    const equipementTrouve = equipements.find(
                        e => e.numeroSerie === numeroSerieRecherche,
                    );

                    if (equipementTrouve) {
                        // Changer le statut vers A_REPARER
                        await this.equipementService.changeStatut(equipementTrouve.id, {
                            nouveauStatut: StatutEquipement.A_REPARER,
                            motif: `Panne signalee depuis stock: ${description}`,
                        });

                        this.logger.log(
                            `✅ Equipement ${equipementTrouve.id} marque A_REPARER suite a panne`,
                        );

                        // Notifier equipement-service du changement de statut
                        await this.rabbitMQPublisher.publishEquipementStatusChangedToEquipementService({
                            equipementId,
                            ancienStatut: equipementTrouve.statut,
                            nouveauStatut: StatutEquipement.A_REPARER,
                            espaceId,
                            motif: description,
                            occurredAt: new Date(),
                        });
                    }
                } catch (updateError) {
                    this.logger.error(`Erreur mise a jour statut: ${updateError}`);
                }
            }

            channel.ack(originalMsg);
        } catch (error) {
            this.logger.error(`❌ Erreur EQUIPEMENT_PANNE_ENREGISTREE: ${error}`);
            channel.ack(originalMsg);
        }
    }

    /**
     * Recoit un evenement de maintenance terminee
     * Met a jour le statut de l'equipement selon le resultat
     */
    @MessagePattern(MESSAGE_PATTERNS.EQUIPEMENT_MAINTENANCE_TERMINEE)
    async handleMaintenanceTerminee(
        @Payload() data: EquipementServiceEvent | {
            equipementId: string;
            reference?: string;
            espaceId?: string;
            dateFinMaintenance: string;
            resultat: 'REPARE' | 'NON_REPARABLE' | 'A_REMPLACER' | string;
            description?: string;
        },
        @Ctx() context: RmqContext,
    ): Promise<void> {
        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();

        try {
            const payload = 'payload' in data ? data.payload : data;
            const equipementId = payload.equipementId as string || (data as EquipementServiceEvent).aggregateId;
            const espaceId = payload.espaceId as string;
            const resultat = payload.resultat as string;
            const description = payload.description as string;

            this.logger.log(
                `📥 Evenement MAINTENANCE_TERMINEE recu - ` +
                `Equipement: ${equipementId}, Resultat: ${resultat}`,
            );

            if (espaceId) {
                try {
                    const equipements = await this.equipementService.findByEspace(espaceId);
                    const numeroSerieRecherche = `STOCK-${equipementId}`;
                    const equipementTrouve = equipements.find(
                        e => e.numeroSerie === numeroSerieRecherche,
                    );

                    if (equipementTrouve) {
                        let nouveauStatut: StatutEquipement;
                        let motif: string;

                        switch (resultat?.toUpperCase()) {
                            case 'REPARE':
                                nouveauStatut = StatutEquipement.BON_ETAT;
                                motif = 'Maintenance terminee - Equipement repare';
                                break;
                            case 'NON_REPARABLE':
                                nouveauStatut = StatutEquipement.HORS_SERVICE;
                                motif = 'Maintenance terminee - Non reparable';
                                break;
                            case 'A_REMPLACER':
                                nouveauStatut = StatutEquipement.A_REMPLACER;
                                motif = 'Maintenance terminee - A remplacer';
                                break;
                            default:
                                nouveauStatut = StatutEquipement.BON_ETAT;
                                motif = `Maintenance terminee - ${resultat}`;
                        }

                        await this.equipementService.changeStatut(equipementTrouve.id, {
                            nouveauStatut,
                            motif: description || motif,
                        });

                        this.logger.log(
                            `✅ Equipement ${equipementTrouve.id} mis a jour: ${nouveauStatut}`,
                        );

                        // Notifier equipement-service
                        await this.rabbitMQPublisher.publishEquipementStatusChangedToEquipementService({
                            equipementId,
                            ancienStatut: equipementTrouve.statut,
                            nouveauStatut,
                            espaceId,
                            motif: description || motif,
                            occurredAt: new Date(),
                        });
                    }
                } catch (updateError) {
                    this.logger.error(`Erreur mise a jour apres maintenance: ${updateError}`);
                }
            }

            channel.ack(originalMsg);
        } catch (error) {
            this.logger.error(`❌ Erreur EQUIPEMENT_MAINTENANCE_TERMINEE: ${error}`);
            channel.ack(originalMsg);
        }
    }
}
