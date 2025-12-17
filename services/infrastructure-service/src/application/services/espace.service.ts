// src/application/services/espace.service.ts

import {
    Injectable,
    Inject,
    NotFoundException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
    IEspaceRepository,
    ESPACE_REPOSITORY,
    IEtageRepository,
    ETAGE_REPOSITORY,
    IBatimentRepository,
    BATIMENT_REPOSITORY,
    IEquipementRepository,
    EQUIPEMENT_REPOSITORY,
    EspaceFilters,
    PaginationOptions,
} from '../../domain/repositories';
import { Espace } from '../../domain/entities';
import { TypeEspace, estUneChambre } from '../../domain/enums';
import { EspaceDefectueuxEvent } from '../../domain/events';
import {
    CreateEspaceDto,
    UpdateEspaceDto,
    EspaceListResponseDto,
    EspaceDetailResponseDto,
    EspaceWithEquipementsResponseDto,
    EspacePaginatedResponseDto,
    EspacesResumeResponseDto,
} from '../dtos/espace';
import { EspaceFactory } from '../factories/espace.factory';
import { EspaceMapper, LocalisationInfo } from '../mappers/espace.mapper';
import { EquipementMapper } from '../mappers/equipement.mapper';
import { RabbitMQPublisherService } from '../../infrastructure/messaging/rabbitmq-publisher.service';

/**
 * Service applicatif pour la gestion des espaces
 */
@Injectable()
export class EspaceService {
    constructor(
        @Inject(ESPACE_REPOSITORY)
        private readonly espaceRepository: IEspaceRepository,
        @Inject(ETAGE_REPOSITORY)
        private readonly etageRepository: IEtageRepository,
        @Inject(BATIMENT_REPOSITORY)
        private readonly batimentRepository: IBatimentRepository,
        @Inject(EQUIPEMENT_REPOSITORY)
        private readonly equipementRepository: IEquipementRepository,
        private readonly espaceFactory: EspaceFactory,
        private readonly espaceMapper: EspaceMapper,
        private readonly equipementMapper: EquipementMapper,
        private readonly eventEmitter: EventEmitter2,
        private readonly rabbitMQPublisher: RabbitMQPublisherService,
    ) {}

    /**
     * Cree un nouvel espace
     */
    async create(dto: CreateEspaceDto): Promise<EspaceDetailResponseDto> {
        // Verifier que l'etage existe
        const etage = await this.etageRepository.findById(dto.etageId);
        if (!etage) {
            throw new NotFoundException(
                `Etage avec l'ID '${dto.etageId}' non trouve`,
            );
        }

        // Verifier unicite du numero dans l'etage
        const existing = await this.espaceRepository.findByEtageAndNumero(
            dto.etageId,
            dto.numero,
        );
        if (existing) {
            throw new ConflictException(
                `L'espace '${dto.numero}' existe deja dans cet etage`,
            );
        }

        // Creer l'espace via la factory
        const espace = this.espaceFactory.create(dto);

        // Sauvegarder
        const savedEspace = await this.espaceRepository.save(espace);

        // Emettre l'evenement
        this.eventEmitter.emit('espace.created', {
            espaceId: savedEspace.id,
            etageId: savedEspace.etageId,
            numero: savedEspace.numero,
            type: savedEspace.type,
        });

        const localisation = await this.getLocalisationInfo(savedEspace);
        return this.espaceMapper.toDetailDto(savedEspace, localisation!);
    }

    /**
     * Cree plusieurs chambres en lot
     */
    async createChambres(
        etageId: string,
        prefixe: string,
        nombreChambres: number,
        type: TypeEspace = TypeEspace.CHAMBRE_SIMPLE,
        debutNumero: number = 1,
    ): Promise<EspaceListResponseDto[]> {
        // Verifier que l'etage existe
        const etage = await this.etageRepository.findById(etageId);
        if (!etage) {
            throw new NotFoundException(
                `Etage avec l'ID '${etageId}' non trouve`,
            );
        }

        // Verifier que le type est une chambre
        if (!estUneChambre(type)) {
            throw new BadRequestException(
                'Cette methode ne peut creer que des chambres',
            );
        }

        // Creer les espaces via la factory
        const espaces = this.espaceFactory.createChambres(
            etageId,
            prefixe,
            nombreChambres,
            type,
            debutNumero,
        );

        // Sauvegarder tous les espaces
        const savedEspaces = await this.espaceRepository.saveMany(espaces);

        // Emettre l'evenement
        this.eventEmitter.emit('espaces.created', {
            etageId,
            nombreEspaces: savedEspaces.length,
            type,
        });

        const localisations = await this.getLocalisationsForEspaces(savedEspaces);
        return this.espaceMapper.toListDtos(savedEspaces, localisations);
    }

    /**
     * Recupere un espace par son ID
     */
    async findById(id: string): Promise<EspaceDetailResponseDto> {
        const espace = await this.espaceRepository.findById(id);
        if (!espace) {
            throw new NotFoundException(`Espace avec l'ID '${id}' non trouve`);
        }
        const localisation = await this.getLocalisationInfo(espace);
        return this.espaceMapper.toDetailDto(espace, localisation!);
    }

    /**
     * Recupere un espace avec sa localisation complete
     */
    async findByIdWithLocalisation(id: string): Promise<EspaceDetailResponseDto | null> {
        const espace = await this.espaceRepository.findById(id);
        if (!espace) {
            return null;
        }
        const localisation = await this.getLocalisationInfo(espace);
        return this.espaceMapper.toDetailDto(espace, localisation!);
    }

    /**
     * Recupere un espace avec ses equipements
     */
    async findByIdWithEquipements(id: string): Promise<EspaceWithEquipementsResponseDto> {
        const espace = await this.espaceRepository.findById(id);
        if (!espace) {
            throw new NotFoundException(`Espace avec l'ID '${id}' non trouve`);
        }

        // Recuperer les equipements
        const equipements = await this.equipementRepository.findByEspaceId(id);
        const equipementsDtos = this.equipementMapper.toListDtos(equipements);

        // Recuperer la localisation complete
        const localisation = await this.getLocalisationInfo(espace);
        if (!localisation) {
            throw new NotFoundException(`Localisation non trouvee pour l'espace '${id}'`);
        }

        return this.espaceMapper.toWithEquipementsDto(espace, equipementsDtos, localisation);
    }

    /**
     * Liste les espaces d'un etage
     */
    async findByEtage(etageId: string): Promise<EspaceListResponseDto[]> {
        const etage = await this.etageRepository.findById(etageId);
        if (!etage) {
            throw new NotFoundException(
                `Etage avec l'ID '${etageId}' non trouve`,
            );
        }

        const espaces = await this.espaceRepository.findActifsByEtage(etageId);
        const localisations = await this.getLocalisationsForEspaces(espaces);
        return this.espaceMapper.toListDtos(espaces, localisations);
    }

    /**
     * Liste les espaces d'un batiment
     */
    async findByBatiment(batimentId: string): Promise<EspaceListResponseDto[]> {
        const batiment = await this.batimentRepository.findById(batimentId);
        if (!batiment) {
            throw new NotFoundException(
                `Batiment avec l'ID '${batimentId}' non trouve`,
            );
        }

        const espaces = await this.espaceRepository.findByBatimentId(batimentId);
        const localisations = await this.getLocalisationsForEspaces(espaces);
        return this.espaceMapper.toListDtos(espaces, localisations);
    }

    /**
     * Liste tous les espaces avec pagination et filtres
     */
    async findAll(
        filters?: EspaceFilters,
        pagination?: PaginationOptions,
    ): Promise<EspacePaginatedResponseDto> {
        const result = await this.espaceRepository.findPaginated(
            pagination || { page: 1, limit: 20 },
        );

        // Appliquer les filtres
        let data = result.data;
        if (filters) {
            if (filters.etageId) {
                data = data.filter(e => e.etageId === filters.etageId);
            }
            if (filters.batimentId) {
                // Filtrage par batiment via etage
                const etages = await this.etageRepository.findByBatimentId(filters.batimentId);
                const etageIds = new Set(etages.map(e => e.id));
                data = data.filter(e => etageIds.has(e.etageId));
            }
            if (filters.type) {
                data = data.filter(e => e.type === filters.type);
            }
            if (filters.estOccupe !== undefined) {
                data = data.filter(e => e.estOccupe === filters.estOccupe);
            }
            if (filters.aEquipementDefectueux !== undefined) {
                data = data.filter(e => e.aEquipementDefectueux === filters.aEquipementDefectueux);
            }
            if (filters.actif !== undefined) {
                data = data.filter(e => e.actif === filters.actif);
            }
        }

        // Recuperer les localisations pour tous les espaces
        const localisations = await this.getLocalisationsForEspaces(data);

        return {
            data: this.espaceMapper.toListDtos(data, localisations),
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages,
            hasNextPage: result.hasNextPage,
            hasPreviousPage: result.hasPreviousPage,
        };
    }

    /**
     * Liste les espaces defectueux
     */
    async findDefectueux(batimentId?: string): Promise<EspaceListResponseDto[]> {
        const espaces = batimentId
            ? await this.espaceRepository.findDefectueuxByBatiment(batimentId)
            : await this.espaceRepository.findDefectueux();
        const localisations = await this.getLocalisationsForEspaces(espaces);
        return this.espaceMapper.toListDtos(espaces, localisations);
    }

    /**
     * Liste les chambres disponibles
     */
    async findChambresDisponibles(): Promise<EspaceListResponseDto[]> {
        const chambres = await this.espaceRepository.findChambresLibres();
        const localisations = await this.getLocalisationsForEspaces(chambres);
        return this.espaceMapper.toListDtos(chambres, localisations);
    }

    /**
     * Met a jour un espace
     */
    async update(id: string, dto: UpdateEspaceDto): Promise<EspaceDetailResponseDto> {
        const espace = await this.espaceRepository.findById(id);
        if (!espace) {
            throw new NotFoundException(`Espace avec l'ID '${id}' non trouve`);
        }

        // Verifier unicite du numero si modifie
        if (dto.numero && dto.numero !== espace.numero) {
            const existing = await this.espaceRepository.findByEtageAndNumero(
                espace.etageId,
                dto.numero,
            );
            if (existing) {
                throw new ConflictException(
                    `L'espace '${dto.numero}' existe deja dans cet etage`,
                );
            }
        }

        // Mettre a jour via la methode de l'entite
        espace.update({
            numero: dto.numero,
            type: dto.type,
            superficie: dto.superficie,
            capacite: dto.capacite,
            description: dto.description,
        });

        const updatedEspace = await this.espaceRepository.save(espace);

        // Emettre l'evenement
        this.eventEmitter.emit('espace.updated', {
            espaceId: updatedEspace.id,
            etageId: updatedEspace.etageId,
        });

        const localisation = await this.getLocalisationInfo(updatedEspace);
        return this.espaceMapper.toDetailDto(updatedEspace, localisation!);
    }

    /**
     * Assigne un occupant a un espace (chambre)
     */
    async assignerOccupant(
        espaceId: string,
        occupantId: string,
        dateDebut?: string,
        dateFin?: string,
    ): Promise<EspaceDetailResponseDto> {
        const espace = await this.espaceRepository.findById(espaceId);
        if (!espace) {
            throw new NotFoundException(`Espace avec l'ID '${espaceId}' non trouve`);
        }

        // Utiliser la methode de l'entite qui fait la validation
        espace.assignerOccupant(occupantId);

        const updatedEspace = await this.espaceRepository.save(espace);

        // Recuperer les infos de localisation pour l'evenement
        const localisation = await this.getLocalisationInfo(updatedEspace);

        // Emettre l'evenement interne
        this.eventEmitter.emit('espace.occupant.assigned', {
            espaceId: updatedEspace.id,
            occupantId,
        });

        // Publier vers RabbitMQ pour notifier user-service
        await this.rabbitMQPublisher.publishEspaceOccupantAssigned({
            espaceId: updatedEspace.id,
            occupantId,
            dateDebut,
            dateFin,
            batimentId: localisation?.batimentId,
            etageId: localisation?.etageId,
            nomEspace: updatedEspace.numero,
            occurredAt: new Date(),
        });

        return this.espaceMapper.toDetailDto(updatedEspace, localisation!);
    }

    /**
     * Libere un espace
     */
    async liberer(espaceId: string): Promise<EspaceDetailResponseDto> {
        const espace = await this.espaceRepository.findById(espaceId);
        if (!espace) {
            throw new NotFoundException(`Espace avec l'ID '${espaceId}' non trouve`);
        }

        const ancienOccupantId = espace.occupantId;
        espace.liberer();

        const updatedEspace = await this.espaceRepository.save(espace);

        // Recuperer les infos de localisation pour l'evenement
        const localisation = await this.getLocalisationInfo(updatedEspace);

        // Emettre l'evenement interne
        this.eventEmitter.emit('espace.liberated', {
            espaceId: updatedEspace.id,
            ancienOccupantId,
        });

        // Publier vers RabbitMQ pour notifier user-service
        await this.rabbitMQPublisher.publishEspaceLiberee({
            espaceId: updatedEspace.id,
            ancienOccupantId: ancienOccupantId || undefined,
            batimentId: localisation?.batimentId,
            etageId: localisation?.etageId,
            nomEspace: updatedEspace.numero,
            occurredAt: new Date(),
        });

        return this.espaceMapper.toDetailDto(updatedEspace, localisation!);
    }

    /**
     * Met a jour le flag de defectuosite d'un espace
     * Appele quand le statut d'un equipement change
     */
    async updateDefectueuxFlag(espaceId: string): Promise<void> {
        const espace = await this.espaceRepository.findById(espaceId);
        if (!espace) {
            return;
        }

        // Compter les equipements defectueux
        const nombreDefectueux = await this.equipementRepository.countDefectueuxByEspace(espaceId);
        const ancienFlag = espace.aEquipementDefectueux;

        espace.mettreAJourEquipementsDefectueux(nombreDefectueux);
        await this.espaceRepository.save(espace);

        // Emettre l'evenement si changement de flag
        if (ancienFlag !== espace.aEquipementDefectueux) {
            // Recuperer les infos de localisation pour l'evenement
            const etage = await this.etageRepository.findById(espace.etageId);
            const batimentId = etage?.batimentId || '';

            const event = EspaceDefectueuxEvent.create({
                espaceId,
                espaceNumero: espace.numero,
                espaceType: espace.type,
                etageId: espace.etageId,
                batimentId,
                devientDefectueux: espace.aEquipementDefectueux,
                nombreEquipementsDefectueux: nombreDefectueux,
                estOccupe: espace.estOccupe,
                occupantId: espace.occupantId,
            });
            this.eventEmitter.emit('espace.defectueux.changed', event);
        }
    }

    /**
     * Desactive un espace (soft delete)
     */
    async desactiver(id: string): Promise<void> {
        const espace = await this.espaceRepository.findById(id);
        if (!espace) {
            throw new NotFoundException(`Espace avec l'ID '${id}' non trouve`);
        }

        if (!espace.actif) {
            throw new BadRequestException('Cet espace est deja desactive');
        }

        if (espace.estOccupe) {
            throw new BadRequestException(
                'Impossible de desactiver un espace occupe',
            );
        }

        espace.desactiver();
        await this.espaceRepository.save(espace);

        // Emettre l'evenement
        this.eventEmitter.emit('espace.deactivated', {
            espaceId: id,
            etageId: espace.etageId,
        });
    }

    /**
     * Reactive un espace
     */
    async reactiver(id: string): Promise<void> {
        const espace = await this.espaceRepository.findById(id);
        if (!espace) {
            throw new NotFoundException(`Espace avec l'ID '${id}' non trouve`);
        }

        if (espace.actif) {
            throw new BadRequestException('Cet espace est deja actif');
        }

        espace.reactiver();
        await this.espaceRepository.save(espace);

        // Emettre l'evenement
        this.eventEmitter.emit('espace.reactivated', {
            espaceId: id,
            etageId: espace.etageId,
        });
    }

    /**
     * Supprime definitivement un espace
     */
    async delete(id: string): Promise<void> {
        const espace = await this.espaceRepository.findById(id);
        if (!espace) {
            throw new NotFoundException(`Espace avec l'ID '${id}' non trouve`);
        }

        // Verifier qu'il n'y a pas d'equipements
        const equipements = await this.equipementRepository.findByEspaceId(id);
        if (equipements.length > 0) {
            throw new BadRequestException(
                'Impossible de supprimer un espace contenant des equipements. ' +
                'Retirez d\'abord tous les equipements.',
            );
        }

        await this.espaceRepository.delete(id);

        // Emettre l'evenement
        this.eventEmitter.emit('espace.deleted', {
            espaceId: id,
            etageId: espace.etageId,
        });
    }

    /**
     * Recupere le resume des espaces
     */
    async getResume(batimentId?: string): Promise<EspacesResumeResponseDto> {
        const resume = await this.espaceRepository.getResume(batimentId);
        return resume;
    }

    /**
     * Recupere les espaces les plus defectueux
     */
    async getMostDefectueux(
        limit: number = 10,
        batimentId?: string,
    ): Promise<EspaceListResponseDto[]> {
        const espaces = await this.espaceRepository.findMostDefectueux(limit, batimentId);
        const localisations = await this.getLocalisationsForEspaces(espaces);
        return this.espaceMapper.toListDtos(espaces, localisations);
    }

    /**
     * Recupere les espaces sans incident
     */
    async getSansIncident(batimentId?: string): Promise<EspaceListResponseDto[]> {
        const espaces = await this.espaceRepository.findSansIncident(batimentId);
        const localisations = await this.getLocalisationsForEspaces(espaces);
        return this.espaceMapper.toListDtos(espaces, localisations);
    }

    /**
     * Recupere les informations de localisation complete d'un espace
     */
    private async getLocalisationInfo(espace: Espace): Promise<LocalisationInfo | undefined> {
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
        };
    }

    /**
     * Recupere les informations de localisation pour une liste d'espaces
     */
    private async getLocalisationsForEspaces(espaces: Espace[]): Promise<Map<string, LocalisationInfo>> {
        const localisations = new Map<string, LocalisationInfo>();

        // Collecter tous les etageIds uniques
        const etageIds = [...new Set(espaces.map(e => e.etageId))];

        // Charger tous les etages en une fois
        const etagesPromises = etageIds.map(id => this.etageRepository.findById(id));
        const etages = await Promise.all(etagesPromises);
        const etagesMap = new Map(etages.filter(e => e !== null).map(e => [e!.id, e!]));

        // Collecter tous les batimentIds uniques
        const batimentIds = [...new Set(etages.filter(e => e !== null).map(e => e!.batimentId))];

        // Charger tous les batiments en une fois
        const batimentsPromises = batimentIds.map(id => this.batimentRepository.findById(id));
        const batiments = await Promise.all(batimentsPromises);
        const batimentsMap = new Map(batiments.filter(b => b !== null).map(b => [b!.id, b!]));

        // Construire les localisations pour chaque etage
        for (const etage of etages) {
            if (!etage) continue;
            const batiment = batimentsMap.get(etage.batimentId);
            if (!batiment) continue;

            localisations.set(etage.id, {
                batimentId: batiment.id,
                batimentNom: batiment.nom,
                batimentCode: batiment.code,
                etageId: etage.id,
                etageNumero: etage.numero,
                etageDesignation: etage.designation,
            });
        }

        return localisations;
    }
}