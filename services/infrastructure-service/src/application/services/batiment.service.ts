// src/application/services/batiment.service.ts

import {
    Injectable,
    Inject,
    NotFoundException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
    IBatimentRepository,
    BATIMENT_REPOSITORY,
    IEtageRepository,
    ETAGE_REPOSITORY,
    BatimentFilters,
    PaginationOptions,
    PaginatedResult,
} from '../../domain/repositories';
import { Batiment, Etage } from '../../domain/entities';
import { TypeBatiment } from '../../domain/enums';
import { Coordonnees } from '../../domain/value-objects';
import {
    CreateBatimentDto,
    UpdateBatimentDto,
    BatimentListResponseDto,
    BatimentDetailResponseDto,
    BatimentWithStatsResponseDto,
    BatimentPaginatedResponseDto,
} from '../dtos/batiment';
import { BatimentFactory } from '../factories/batiment.factory';
import { EtageFactory } from '../factories/etage.factory';
import { BatimentMapper } from '../mappers/batiment.mapper';

/**
 * Service applicatif pour la gestion des batiments
 * Orchestre les operations CRUD et la logique metier
 */
@Injectable()
export class BatimentService {
    constructor(
        @Inject(BATIMENT_REPOSITORY)
        private readonly batimentRepository: IBatimentRepository,
        @Inject(ETAGE_REPOSITORY)
        private readonly etageRepository: IEtageRepository,
        private readonly batimentFactory: BatimentFactory,
        private readonly etageFactory: EtageFactory,
        private readonly batimentMapper: BatimentMapper,
        private readonly eventEmitter: EventEmitter2,
    ) {}

    /**
     * Cree un nouveau batiment avec ses etages
     */
    async create(dto: CreateBatimentDto): Promise<BatimentDetailResponseDto> {
        // Verifier unicite du code
        const codeExists = await this.batimentRepository.codeExists(dto.code);
        if (codeExists) {
            throw new ConflictException(
                `Un batiment avec le code '${dto.code}' existe deja`,
            );
        }

        // Creer le batiment via la factory
        const batiment = this.batimentFactory.create(dto);

        // Sauvegarder le batiment
        const savedBatiment = await this.batimentRepository.save(batiment);

        // Creer les etages si nombreEtages est specifie
        if (dto.nombreEtages && dto.nombreEtages > 0) {
            const etages = this.etageFactory.createMultiple(
                savedBatiment.id,
                dto.nombreEtages,
                false, // Sans sous-sol par defaut
            );
            await this.etageRepository.saveMany(etages);
        }

        // Emettre l'evenement de creation
        this.eventEmitter.emit('batiment.created', {
            batimentId: savedBatiment.id,
            code: savedBatiment.code,
            type: savedBatiment.type,
        });

        return this.batimentMapper.toDetailDto(savedBatiment);
    }

    /**
     * Recupere un batiment par son ID
     */
    async findById(id: string): Promise<BatimentDetailResponseDto> {
        const batiment = await this.batimentRepository.findById(id);
        if (!batiment) {
            throw new NotFoundException(`Batiment avec l'ID '${id}' non trouve`);
        }
        return this.batimentMapper.toDetailDto(batiment);
    }

    /**
     * Recupere un batiment avec ses statistiques
     */
    async findByIdWithStats(id: string): Promise<BatimentWithStatsResponseDto> {
        const batiment = await this.batimentRepository.findById(id);
        if (!batiment) {
            throw new NotFoundException(`Batiment avec l'ID '${id}' non trouve`);
        }

        const stats = await this.batimentRepository.getStats(id);
        if (!stats) {
            throw new NotFoundException(`Statistiques non trouvees pour le batiment '${id}'`);
        }
        return this.batimentMapper.toWithStatsDto(batiment, stats);
    }

    /**
     * Recupere un batiment par son code
     */
    async findByCode(code: string): Promise<BatimentDetailResponseDto> {
        const batiment = await this.batimentRepository.findByCode(code);
        if (!batiment) {
            throw new NotFoundException(`Batiment avec le code '${code}' non trouve`);
        }
        return this.batimentMapper.toDetailDto(batiment);
    }

    /**
     * Liste tous les batiments avec pagination et filtres
     */
    async findAll(
        filters?: BatimentFilters,
        pagination?: PaginationOptions,
    ): Promise<BatimentPaginatedResponseDto> {
        const result = await this.batimentRepository.findWithFilters(
            filters || {},
            pagination || { page: 1, limit: 20 },
        );

        return {
            data: this.batimentMapper.toListDtos(result.data),
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages,
            hasNextPage: result.hasNextPage,
            hasPreviousPage: result.hasPreviousPage,
        };
    }

    /**
     * Liste les batiments actifs
     */
    async findActifs(): Promise<BatimentListResponseDto[]> {
        const batiments = await this.batimentRepository.findActifs();
        return this.batimentMapper.toListDtos(batiments);
    }

    /**
     * Liste les batiments par type
     */
    async findByType(type: TypeBatiment): Promise<BatimentListResponseDto[]> {
        const batiments = await this.batimentRepository.findByType(type);
        return this.batimentMapper.toListDtos(batiments);
    }

    /**
     * Met a jour un batiment
     */
    async update(
        id: string,
        dto: UpdateBatimentDto,
    ): Promise<BatimentDetailResponseDto> {
        const batiment = await this.batimentRepository.findById(id);
        if (!batiment) {
            throw new NotFoundException(`Batiment avec l'ID '${id}' non trouve`);
        }

        // Verifier unicite du code si modifie
        if (dto.code && dto.code !== batiment.code) {
            const codeExists = await this.batimentRepository.codeExists(dto.code);
            if (codeExists) {
                throw new ConflictException(
                    `Un batiment avec le code '${dto.code}' existe deja`,
                );
            }
        }

        // Preparer les coordonnees si fournies
        let coordonnees: Coordonnees | null | undefined = undefined;
        if (dto.coordonnees !== undefined) {
            if (dto.coordonnees) {
                const { Coordonnees: CoordonneesVO } = await import('../../domain/value-objects');
                coordonnees = CoordonneesVO.create(
                    dto.coordonnees.latitude,
                    dto.coordonnees.longitude,
                    dto.coordonnees.altitude,
                );
            } else {
                coordonnees = null;
            }
        }

        // Mettre a jour via la methode de l'entite
        batiment.update({
            nom: dto.nom,
            type: dto.type,
            adresse: dto.adresse,
            coordonnees,
            nombreEtages: dto.nombreEtages,
            superficie: dto.superficie,
            description: dto.description,
            planBatiment: dto.planBatiment,
        });

        const updatedBatiment = await this.batimentRepository.save(batiment);

        // Emettre l'evenement de mise a jour
        this.eventEmitter.emit('batiment.updated', {
            batimentId: updatedBatiment.id,
            code: updatedBatiment.code,
        });

        return this.batimentMapper.toDetailDto(updatedBatiment);
    }

    /**
     * Desactive un batiment (soft delete)
     */
    async desactiver(id: string): Promise<void> {
        const batiment = await this.batimentRepository.findById(id);
        if (!batiment) {
            throw new NotFoundException(`Batiment avec l'ID '${id}' non trouve`);
        }

        if (!batiment.actif) {
            throw new BadRequestException('Ce batiment est deja desactive');
        }

        batiment.desactiver();
        await this.batimentRepository.save(batiment);

        // Emettre l'evenement de desactivation
        this.eventEmitter.emit('batiment.deactivated', {
            batimentId: id,
            code: batiment.code,
        });
    }

    /**
     * Reactive un batiment
     */
    async reactiver(id: string): Promise<BatimentDetailResponseDto> {
        const batiment = await this.batimentRepository.findById(id);
        if (!batiment) {
            throw new NotFoundException(`Batiment avec l'ID '${id}' non trouve`);
        }

        if (batiment.actif) {
            throw new BadRequestException('Ce batiment est deja actif');
        }

        batiment.reactiver();
        const updatedBatiment = await this.batimentRepository.save(batiment);

        // Emettre l'evenement de reactivation
        this.eventEmitter.emit('batiment.reactivated', {
            batimentId: id,
            code: batiment.code,
        });

        return this.batimentMapper.toDetailDto(updatedBatiment);
    }

    /**
     * Supprime definitivement un batiment
     */
    async delete(id: string): Promise<void> {
        const batiment = await this.batimentRepository.findById(id);
        if (!batiment) {
            throw new NotFoundException(`Batiment avec l'ID '${id}' non trouve`);
        }

        // Verifier qu'il n'y a pas d'etages avec des espaces
        const etages = await this.etageRepository.findByBatimentId(id);
        if (etages.length > 0) {
            throw new BadRequestException(
                'Impossible de supprimer un batiment contenant des etages. ' +
                'Supprimez d\'abord tous les etages.',
            );
        }

        await this.batimentRepository.delete(id);

        // Emettre l'evenement de suppression
        this.eventEmitter.emit('batiment.deleted', {
            batimentId: id,
            code: batiment.code,
        });
    }

    /**
     * Recupere les statistiques globales de tous les batiments
     */
    async getStatistiquesGlobales(): Promise<Record<string, any>> {
        const allStats = await this.batimentRepository.getAllStats();
        const countByType = await this.batimentRepository.countByType();

        return {
            nombreBatiments: allStats.length,
            parType: countByType,
            statistiquesParBatiment: allStats,
        };
    }

    /**
     * Genere un code unique pour un nouveau batiment
     */
    async generateCode(type: TypeBatiment): Promise<string> {
        // Compter les batiments existants de ce type
        const batiments = await this.batimentRepository.findByType(type);
        const sequence = batiments.length + 1;
        return this.batimentFactory.generateCode(type, sequence);
    }
}