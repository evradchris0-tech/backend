// src/application/services/equipement.service.ts

import {
    Injectable,
    Inject,
    NotFoundException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
    IEquipementRepository,
    EQUIPEMENT_REPOSITORY,
    IEspaceRepository,
    ESPACE_REPOSITORY,
    IEtageRepository,
    ETAGE_REPOSITORY,
    IBatimentRepository,
    BATIMENT_REPOSITORY,
    EquipementFilters,
    PaginationOptions,
} from '../../domain/repositories';
import { Equipement } from '../../domain/entities';
import { TypeEquipement, StatutEquipement, CategorieEquipement } from '../../domain/enums';
import { EquipementStatusChangedEvent, EquipementAssigneEvent } from '../../domain/events';
import {
    CreateEquipementDto,
    UpdateEquipementDto,
    ChangeStatutEquipementDto,
    AssignerEquipementDto,
    EquipementListResponseDto,
    EquipementDetailResponseDto,
    EquipementWithRisqueResponseDto,
    EquipementPaginatedResponseDto,
    EquipementsResumeResponseDto,
    PredictionMaintenanceResponseDto,
} from '../dtos/equipement';
import { EquipementFactory } from '../factories/equipement.factory';
import { EquipementMapper } from '../mappers/equipement.mapper';
import { LocalisationInfo } from '../mappers/espace.mapper';
import { RabbitMQPublisherService } from '../../infrastructure/messaging/rabbitmq-publisher.service';

/**
 * Service applicatif pour la gestion des equipements
 */
@Injectable()
export class EquipementService {
    constructor(
        @Inject(EQUIPEMENT_REPOSITORY)
        private readonly equipementRepository: IEquipementRepository,
        @Inject(ESPACE_REPOSITORY)
        private readonly espaceRepository: IEspaceRepository,
        @Inject(ETAGE_REPOSITORY)
        private readonly etageRepository: IEtageRepository,
        @Inject(BATIMENT_REPOSITORY)
        private readonly batimentRepository: IBatimentRepository,
        private readonly equipementFactory: EquipementFactory,
        private readonly equipementMapper: EquipementMapper,
        private readonly eventEmitter: EventEmitter2,
        private readonly rabbitMQPublisher: RabbitMQPublisherService,
    ) {}

    /**
     * Cree un nouvel equipement
     */
    async create(dto: CreateEquipementDto): Promise<EquipementDetailResponseDto> {
        // Verifier unicite du numero de serie si fourni
        if (dto.numeroSerie) {
            const exists = await this.equipementRepository.numeroSerieExists(dto.numeroSerie);
            if (exists) {
                throw new ConflictException(
                    `Un equipement avec le numero de serie '${dto.numeroSerie}' existe deja`,
                );
            }
        }

        // Verifier que l'espace existe si fourni
        if (dto.espaceId) {
            const espace = await this.espaceRepository.findById(dto.espaceId);
            if (!espace) {
                throw new NotFoundException(
                    `Espace avec l'ID '${dto.espaceId}' non trouve`,
                );
            }
        }

        // Creer l'equipement via la factory
        const equipement = this.equipementFactory.create(dto);

        // Sauvegarder
        const savedEquipement = await this.equipementRepository.save(equipement);

        // Emettre l'evenement
        this.eventEmitter.emit('equipement.created', {
            equipementId: savedEquipement.id,
            type: savedEquipement.type,
            espaceId: savedEquipement.espaceId,
        });

        // Si assigne a un espace, emettre aussi l'evenement d'assignation
        if (savedEquipement.espaceId) {
            const event = EquipementAssigneEvent.creerAssignation({
                equipementId: savedEquipement.id,
                equipementType: savedEquipement.type,
                equipementNom: `${savedEquipement.marque || ''} ${savedEquipement.modele || ''}`.trim() || 'Equipement',
                ancienEspaceId: null,
                nouvelEspaceId: savedEquipement.espaceId,
            });
            this.eventEmitter.emit('equipement.assigned', event);
        }

        return this.equipementMapper.toDetailDto(savedEquipement);
    }

    /**
     * Cree un lot d'equipements identiques
     */
    async createLot(
        type: TypeEquipement,
        quantite: number,
        marque?: string,
        modele?: string,
        dateAcquisition?: Date,
        valeurUnitaire?: number,
    ): Promise<EquipementListResponseDto[]> {
        const equipements = this.equipementFactory.createLot(
            type,
            quantite,
            marque,
            modele,
            dateAcquisition,
            valeurUnitaire,
        );

        const savedEquipements = await this.equipementRepository.saveMany(equipements);

        // Emettre l'evenement
        this.eventEmitter.emit('equipements.created', {
            type,
            quantite: savedEquipements.length,
        });

        return this.equipementMapper.toListDtos(savedEquipements);
    }

    /**
     * Cree un kit standard pour une chambre
     */
    async createKitChambre(
        espaceId: string,
        dateAcquisition?: Date,
    ): Promise<EquipementListResponseDto[]> {
        // Verifier que l'espace existe et est une chambre
        const espace = await this.espaceRepository.findById(espaceId);
        if (!espace) {
            throw new NotFoundException(`Espace avec l'ID '${espaceId}' non trouve`);
        }

        if (!espace.estUneChambre()) {
            throw new BadRequestException(
                'Le kit chambre ne peut etre assigne qu\'a une chambre',
            );
        }

        // Creer le kit via la factory
        const equipements = this.equipementFactory.createKitChambre(dateAcquisition);

        // Assigner tous les equipements a l'espace
        for (const equipement of equipements) {
            equipement.assignerAEspace(espaceId);
        }

        const savedEquipements = await this.equipementRepository.saveMany(equipements);

        // Emettre l'evenement
        this.eventEmitter.emit('equipements.kit.created', {
            espaceId,
            type: 'chambre',
            quantite: savedEquipements.length,
        });

        return this.equipementMapper.toListDtos(savedEquipements);
    }

    /**
     * Recupere un equipement par son ID
     */
    async findById(id: string): Promise<EquipementDetailResponseDto> {
        const equipement = await this.equipementRepository.findById(id);
        if (!equipement) {
            throw new NotFoundException(`Equipement avec l'ID '${id}' non trouve`);
        }
        return this.equipementMapper.toDetailDto(equipement);
    }

    /**
     * Recupere un equipement avec sa localisation complete
     */
    async findByIdWithLocalisation(id: string): Promise<EquipementDetailResponseDto & { localisation?: any }> {
        const equipement = await this.equipementRepository.findById(id);
        if (!equipement) {
            throw new NotFoundException(`Equipement avec l'ID '${id}' non trouve`);
        }

        if (!equipement.espaceId) {
            return this.equipementMapper.toDetailDto(equipement);
        }

        const localisation = await this.getLocalisationInfo(equipement.espaceId);
        if (!localisation) {
            return this.equipementMapper.toDetailDto(equipement);
        }

        return this.equipementMapper.toDetailDto(equipement, localisation);
    }

    /**
     * Liste les equipements d'un espace
     */
    async findByEspace(espaceId: string): Promise<EquipementListResponseDto[]> {
        const espace = await this.espaceRepository.findById(espaceId);
        if (!espace) {
            throw new NotFoundException(`Espace avec l'ID '${espaceId}' non trouve`);
        }

        const equipements = await this.equipementRepository.findByEspaceId(espaceId);
        return this.equipementMapper.toListDtos(equipements);
    }

    /**
     * Liste les equipements d'un batiment
     */
    async findByBatiment(batimentId: string): Promise<EquipementListResponseDto[]> {
        const batiment = await this.batimentRepository.findById(batimentId);
        if (!batiment) {
            throw new NotFoundException(`Batiment avec l'ID '${batimentId}' non trouve`);
        }

        const equipements = await this.equipementRepository.findByBatimentId(batimentId);
        return this.equipementMapper.toListDtos(equipements);
    }

    /**
     * Liste tous les equipements avec pagination et filtres
     */
    async findAll(
        filters?: EquipementFilters,
        pagination?: PaginationOptions,
    ): Promise<EquipementPaginatedResponseDto> {
        const result = await this.equipementRepository.findPaginated(
            pagination || { page: 1, limit: 20 },
        );

        // Appliquer les filtres
        let data = result.data;
        if (filters) {
            if (filters.type) {
                data = data.filter(e => e.type === filters.type);
            }
            if (filters.statut) {
                data = data.filter(e => e.statut === filters.statut);
            }
            if (filters.espaceId) {
                data = data.filter(e => e.espaceId === filters.espaceId);
            }
            if (filters.estAssigne !== undefined) {
                data = filters.estAssigne
                    ? data.filter(e => e.espaceId !== undefined)
                    : data.filter(e => e.espaceId === undefined);
            }
            if (filters.actif !== undefined) {
                data = data.filter(e => e.actif === filters.actif);
            }
        }

        return {
            data: this.equipementMapper.toListDtos(data),
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages,
            hasNextPage: result.hasNextPage,
            hasPreviousPage: result.hasPreviousPage,
        };
    }

    /**
     * Liste les equipements defectueux
     */
    async findDefectueux(espaceId?: string): Promise<EquipementListResponseDto[]> {
        const equipements = espaceId
            ? await this.equipementRepository.findDefectueuxByEspace(espaceId)
            : await this.equipementRepository.findDefectueux();
        return this.equipementMapper.toListDtos(equipements);
    }

    /**
     * Liste les equipements a remplacer
     */
    async findARemplacer(): Promise<EquipementListResponseDto[]> {
        const equipements = await this.equipementRepository.findARemplacer();
        return this.equipementMapper.toListDtos(equipements);
    }

    /**
     * Liste les equipements non assignes
     */
    async findNonAssignes(type?: TypeEquipement): Promise<EquipementListResponseDto[]> {
        const equipements = await this.equipementRepository.findNonAssignes();
        const filtered = type
            ? equipements.filter(e => e.type === type)
            : equipements;
        return this.equipementMapper.toListDtos(filtered);
    }

    /**
     * Met a jour un equipement
     */
    async update(id: string, dto: UpdateEquipementDto): Promise<EquipementDetailResponseDto> {
        const equipement = await this.equipementRepository.findById(id);
        if (!equipement) {
            throw new NotFoundException(`Equipement avec l'ID '${id}' non trouve`);
        }

        // Verifier unicite du numero de serie si modifie
        if (dto.numeroSerie && dto.numeroSerie !== equipement.numeroSerie) {
            const exists = await this.equipementRepository.numeroSerieExists(dto.numeroSerie);
            if (exists) {
                throw new ConflictException(
                    `Un equipement avec le numero de serie '${dto.numeroSerie}' existe deja`,
                );
            }
        }

        // Mettre a jour via la methode de l'entite
        equipement.update({
            marque: dto.marque,
            modele: dto.modele,
            numeroSerie: dto.numeroSerie,
            dateAcquisition: dto.dateAcquisition !== undefined
                ? (dto.dateAcquisition ? new Date(dto.dateAcquisition) : null)
                : undefined,
            valeurAchat: dto.valeurAchat,
            description: dto.description,
        });

        const updatedEquipement = await this.equipementRepository.save(equipement);

        // Emettre l'evenement
        this.eventEmitter.emit('equipement.updated', {
            equipementId: updatedEquipement.id,
        });

        return this.equipementMapper.toDetailDto(updatedEquipement);
    }

    /**
     * Change le statut d'un equipement
     */
    async changeStatut(
        id: string,
        dto: ChangeStatutEquipementDto,
        utilisateurId?: string,
    ): Promise<EquipementDetailResponseDto> {
        const equipement = await this.equipementRepository.findById(id);
        if (!equipement) {
            throw new NotFoundException(`Equipement avec l'ID '${id}' non trouve`);
        }

        const ancienStatut = equipement.statut;

        // Utiliser la methode de l'entite qui fait la validation
        const result = equipement.changerStatut(dto.nouveauStatut, dto.motif);

        const updatedEquipement = await this.equipementRepository.save(equipement);

        // Creer et emettre l'evenement de changement de statut (interne)
        const event = EquipementStatusChangedEvent.create({
            equipementId: updatedEquipement.id,
            equipementType: updatedEquipement.type,
            ancienStatut,
            nouveauStatut: dto.nouveauStatut,
            espaceId: updatedEquipement.espaceId,
            motif: dto.motif,
            devientDefectueux: result.devientDefectueux,
            devientFonctionnel: result.devientFonctionnel,
        });
        this.eventEmitter.emit('equipement.status.changed', event);

        // Recuperer les infos de localisation pour l'evenement RabbitMQ
        let batimentId: string | undefined;
        if (updatedEquipement.espaceId) {
            const localisation = await this.getLocalisationInfo(updatedEquipement.espaceId);
            batimentId = localisation?.batimentId;
        }

        // Publier vers RabbitMQ pour notifier les autres services
        await this.rabbitMQPublisher.publishEquipementStatusChanged({
            equipementId: updatedEquipement.id,
            ancienStatut,
            nouveauStatut: dto.nouveauStatut,
            espaceId: updatedEquipement.espaceId || undefined,
            batimentId,
            occurredAt: new Date(),
        });

        // Si l'equipement est assigne, mettre a jour le flag de l'espace
        if (updatedEquipement.espaceId) {
            this.eventEmitter.emit('espace.defectueux.update.required', {
                espaceId: updatedEquipement.espaceId,
            });
        }

        return this.equipementMapper.toDetailDto(updatedEquipement);
    }

    /**
     * Assigne un equipement a un espace
     */
    async assignerAEspace(
        id: string,
        espaceIdOrDto: string | AssignerEquipementDto,
    ): Promise<EquipementDetailResponseDto> {
        const espaceId = typeof espaceIdOrDto === 'string' ? espaceIdOrDto : espaceIdOrDto.espaceId;
        const responsableId = typeof espaceIdOrDto === 'string' ? undefined : espaceIdOrDto.responsableId;

        const equipement = await this.equipementRepository.findById(id);
        if (!equipement) {
            throw new NotFoundException(`Equipement avec l'ID '${id}' non trouve`);
        }

        // Verifier que l'espace existe
        const espace = await this.espaceRepository.findById(espaceId);
        if (!espace) {
            throw new NotFoundException(`Espace avec l'ID '${espaceId}' non trouve`);
        }

        const ancienEspaceId = equipement.espaceId;
        equipement.assignerAEspace(espaceId);

        const updatedEquipement = await this.equipementRepository.save(equipement);

        // Emettre l'evenement d'assignation (interne)
        const equipementNom = `${updatedEquipement.marque || ''} ${updatedEquipement.modele || ''}`.trim() || 'Equipement';
        const event = ancienEspaceId
            ? EquipementAssigneEvent.creerTransfert({
                equipementId: updatedEquipement.id,
                equipementType: updatedEquipement.type,
                equipementNom,
                ancienEspaceId,
                nouvelEspaceId: espaceId,
            })
            : EquipementAssigneEvent.creerAssignation({
                equipementId: updatedEquipement.id,
                equipementType: updatedEquipement.type,
                equipementNom,
                ancienEspaceId: null,
                nouvelEspaceId: espaceId,
            });
        this.eventEmitter.emit('equipement.assigned', event);

        // Publier vers RabbitMQ pour notifier user-service
        await this.rabbitMQPublisher.publishEquipementAssigned({
            equipementId: updatedEquipement.id,
            espaceId,
            responsableId,
            typeEquipement: updatedEquipement.type,
            occurredAt: new Date(),
        });

        // Mettre a jour les flags des espaces concernes
        if (ancienEspaceId) {
            this.eventEmitter.emit('espace.defectueux.update.required', {
                espaceId: ancienEspaceId,
            });
        }
        this.eventEmitter.emit('espace.defectueux.update.required', {
            espaceId,
        });

        return this.equipementMapper.toDetailDto(updatedEquipement);
    }

    /**
     * Retire un equipement de son espace
     */
    async retirerDeEspace(id: string): Promise<EquipementDetailResponseDto> {
        const equipement = await this.equipementRepository.findById(id);
        if (!equipement) {
            throw new NotFoundException(`Equipement avec l'ID '${id}' non trouve`);
        }

        if (!equipement.espaceId) {
            throw new BadRequestException('Cet equipement n\'est pas assigne a un espace');
        }

        const ancienEspaceId = equipement.espaceId;
        const typeEquipement = equipement.type;
        equipement.retirerDeEspace();

        const updatedEquipement = await this.equipementRepository.save(equipement);

        // Emettre l'evenement de retrait (interne)
        const equipementNom = `${updatedEquipement.marque || ''} ${updatedEquipement.modele || ''}`.trim() || 'Equipement';
        const event = EquipementAssigneEvent.creerDesassignation({
            equipementId: updatedEquipement.id,
            equipementType: updatedEquipement.type,
            equipementNom,
            ancienEspaceId,
        });
        this.eventEmitter.emit('equipement.removed', event);

        // Publier vers RabbitMQ pour notifier les autres services
        await this.rabbitMQPublisher.publishEquipementRemoved({
            equipementId: updatedEquipement.id,
            espaceId: ancienEspaceId,
            typeEquipement,
            occurredAt: new Date(),
        });

        // Mettre a jour le flag de l'espace
        this.eventEmitter.emit('espace.defectueux.update.required', {
            espaceId: ancienEspaceId,
        });

        return this.equipementMapper.toDetailDto(updatedEquipement);
    }

    /**
     * Desactive un equipement (soft delete)
     */
    async desactiver(id: string): Promise<void> {
        const equipement = await this.equipementRepository.findById(id);
        if (!equipement) {
            throw new NotFoundException(`Equipement avec l'ID '${id}' non trouve`);
        }

        equipement.desactiver();
        await this.equipementRepository.save(equipement);

        // Emettre l'evenement
        this.eventEmitter.emit('equipement.deactivated', {
            equipementId: id,
            type: equipement.type,
            espaceId: equipement.espaceId,
        });
    }

    /**
     * Supprime definitivement un equipement
     */
    async delete(id: string): Promise<void> {
        const equipement = await this.equipementRepository.findById(id);
        if (!equipement) {
            throw new NotFoundException(`Equipement avec l'ID '${id}' non trouve`);
        }

        const espaceId = equipement.espaceId;

        await this.equipementRepository.delete(id);

        // Emettre l'evenement
        this.eventEmitter.emit('equipement.deleted', {
            equipementId: id,
            type: equipement.type,
            espaceId,
        });

        // Mettre a jour le flag de l'espace si assigne
        if (espaceId) {
            this.eventEmitter.emit('espace.defectueux.update.required', {
                espaceId,
            });
        }
    }

    /**
     * Recupere le resume des equipements
     */
    async getResume(batimentId?: string): Promise<EquipementsResumeResponseDto> {
        return this.equipementRepository.getResume(batimentId);
    }

    /**
     * Liste les equipements a haut risque de panne
     */
    async findHautRisque(
        seuilScore: number = 70,
    ): Promise<EquipementWithRisqueResponseDto[]> {
        const equipementsAvecRisque = await this.equipementRepository.findHautRisque(seuilScore);
        return this.equipementMapper.toWithRisqueDtos(equipementsAvecRisque);
    }

    /**
     * Liste les equipements vieillissants
     */
    async findVieillissants(
        pourcentageVieMax: number = 20,
    ): Promise<EquipementWithRisqueResponseDto[]> {
        const equipements = await this.equipementRepository.findVieillissants(pourcentageVieMax);
        return this.equipementMapper.toWithRisqueDtos(equipements);
    }

    /**
     * Genere une prediction de maintenance pour un equipement
     */
    async getPrediction(id: string): Promise<PredictionMaintenanceResponseDto> {
        const equipement = await this.equipementRepository.findById(id);
        if (!equipement) {
            throw new NotFoundException(`Equipement avec l'ID '${id}' non trouve`);
        }

        return this.equipementMapper.toPredictionDto(equipement);
    }

    /**
     * Genere les predictions pour tous les equipements a risque
     */
    async getPredictionsGlobales(
        seuilScore: number = 50,
    ): Promise<PredictionMaintenanceResponseDto[]> {
        const equipementsHautRisque = await this.equipementRepository.findHautRisque(seuilScore);

        return equipementsHautRisque.map(equipement =>
            this.equipementMapper.toPredictionDto(equipement),
        );
    }

    /**
     * Recupere les informations de localisation complete
     */
    private async getLocalisationInfo(
        espaceId: string,
    ): Promise<(LocalisationInfo & { espaceNumero: string }) | undefined> {
        const espace = await this.espaceRepository.findById(espaceId);
        if (!espace) {
            return undefined;
        }

        const etage = await this.etageRepository.findById(espace.etageId);
        if (!etage) {
            return undefined;
        }

        const batiment = await this.batimentRepository.findById(etage.batimentId);
        if (!batiment) {
            return undefined;
        }

        return {
            batimentId: batiment.id,
            batimentNom: batiment.nom,
            batimentCode: batiment.code,
            etageId: etage.id,
            etageNumero: etage.numero,
            etageDesignation: etage.designation,
            espaceNumero: espace.numero,
        };
    }
}