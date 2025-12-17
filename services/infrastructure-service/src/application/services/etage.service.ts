// src/application/services/etage.service.ts

import {
    Injectable,
    Inject,
    NotFoundException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
    IEtageRepository,
    ETAGE_REPOSITORY,
    IBatimentRepository,
    BATIMENT_REPOSITORY,
    IEspaceRepository,
    ESPACE_REPOSITORY,
    EtageFilters,
    PaginationOptions,
} from '../../domain/repositories';
import { Etage } from '../../domain/entities';
import {
    CreateEtageDto,
    UpdateEtageDto,
    EtageListResponseDto,
    EtageDetailResponseDto,
    EtageWithStatsResponseDto,
    EtagePaginatedResponseDto,
} from '../dtos/etage';
import { EtageFactory } from '../factories/etage.factory';
import { EtageMapper } from '../mappers/etage.mapper';

/**
 * Service applicatif pour la gestion des etages
 */
@Injectable()
export class EtageService {
    constructor(
        @Inject(ETAGE_REPOSITORY)
        private readonly etageRepository: IEtageRepository,
        @Inject(BATIMENT_REPOSITORY)
        private readonly batimentRepository: IBatimentRepository,
        @Inject(ESPACE_REPOSITORY)
        private readonly espaceRepository: IEspaceRepository,
        private readonly etageFactory: EtageFactory,
        private readonly etageMapper: EtageMapper,
        private readonly eventEmitter: EventEmitter2,
    ) {}

    /**
     * Cree un nouvel etage
     */
    async create(dto: CreateEtageDto): Promise<EtageDetailResponseDto> {
        // Verifier que le batiment existe
        const batiment = await this.batimentRepository.findById(dto.batimentId);
        if (!batiment) {
            throw new NotFoundException(
                `Batiment avec l'ID '${dto.batimentId}' non trouve`,
            );
        }

        // Verifier unicite du numero d'etage dans le batiment
        const numeroExists = await this.etageRepository.numeroExists(
            dto.batimentId,
            dto.numero,
        );
        if (numeroExists) {
            throw new ConflictException(
                `L'etage numero ${dto.numero} existe deja dans ce batiment`,
            );
        }

        // Creer l'etage via la factory
        const etage = this.etageFactory.create(dto);

        // Sauvegarder
        const savedEtage = await this.etageRepository.save(etage);

        // Mettre a jour le nombre d'etages du batiment si necessaire
        const etagesCount = await this.etageRepository.countByBatiment(dto.batimentId);
        if (etagesCount > batiment.nombreEtages) {
            batiment.update({ nombreEtages: etagesCount });
            await this.batimentRepository.save(batiment);
        }

        // Emettre l'evenement
        this.eventEmitter.emit('etage.created', {
            etageId: savedEtage.id,
            batimentId: savedEtage.batimentId,
            numero: savedEtage.numero,
        });

        return this.etageMapper.toDetailDto(savedEtage);
    }

    /**
     * Cree plusieurs etages pour un batiment
     */
    async createMultiple(
        batimentId: string,
        nombreEtages: number,
        avecSousSol: boolean = false,
    ): Promise<EtageListResponseDto[]> {
        // Verifier que le batiment existe
        const batiment = await this.batimentRepository.findById(batimentId);
        if (!batiment) {
            throw new NotFoundException(
                `Batiment avec l'ID '${batimentId}' non trouve`,
            );
        }

        // Verifier qu'il n'y a pas deja des etages
        const existingEtages = await this.etageRepository.findByBatimentId(batimentId);
        if (existingEtages.length > 0) {
            throw new ConflictException(
                'Ce batiment a deja des etages. Utilisez la methode create pour ajouter des etages individuellement.',
            );
        }

        // Creer les etages via la factory
        const etages = this.etageFactory.createMultiple(
            batimentId,
            nombreEtages,
            avecSousSol,
        );

        // Sauvegarder tous les etages
        const savedEtages = await this.etageRepository.saveMany(etages);

        // Mettre a jour le nombre d'etages du batiment
        batiment.update({ nombreEtages: savedEtages.length });
        await this.batimentRepository.save(batiment);

        // Emettre l'evenement
        this.eventEmitter.emit('etages.created', {
            batimentId,
            nombreEtages: savedEtages.length,
        });

        return this.etageMapper.toListDtos(savedEtages);
    }

    /**
     * Recupere un etage par son ID
     */
    async findById(id: string): Promise<EtageDetailResponseDto> {
        const etage = await this.etageRepository.findById(id);
        if (!etage) {
            throw new NotFoundException(`Etage avec l'ID '${id}' non trouve`);
        }
        return this.etageMapper.toDetailDto(etage);
    }

    /**
     * Recupere un etage avec ses statistiques
     */
    async findByIdWithStats(id: string): Promise<EtageWithStatsResponseDto> {
        const etage = await this.etageRepository.findById(id);
        if (!etage) {
            throw new NotFoundException(`Etage avec l'ID '${id}' non trouve`);
        }

        const stats = await this.etageRepository.getStats(id);
        if (!stats) {
            throw new NotFoundException(`Statistiques non trouvees pour l'etage '${id}'`);
        }
        return this.etageMapper.toWithStatsDto(etage, stats);
    }

    /**
     * Liste les etages d'un batiment
     */
    async findByBatiment(batimentId: string): Promise<EtageListResponseDto[]> {
        // Verifier que le batiment existe
        const batiment = await this.batimentRepository.findById(batimentId);
        if (!batiment) {
            throw new NotFoundException(
                `Batiment avec l'ID '${batimentId}' non trouve`,
            );
        }

        const etages = await this.etageRepository.findActifsByBatiment(batimentId);
        return this.etageMapper.toListDtos(etages);
    }

    /**
     * Recupere un etage par batiment et numero
     */
    async findByBatimentAndNumero(
        batimentId: string,
        numero: number,
    ): Promise<EtageDetailResponseDto> {
        const etage = await this.etageRepository.findByBatimentAndNumero(
            batimentId,
            numero,
        );
        if (!etage) {
            throw new NotFoundException(
                `Etage numero ${numero} non trouve dans le batiment '${batimentId}'`,
            );
        }
        return this.etageMapper.toDetailDto(etage);
    }

    /**
     * Liste tous les etages avec pagination
     */
    async findAll(
        filters?: EtageFilters,
        pagination?: PaginationOptions,
    ): Promise<EtagePaginatedResponseDto> {
        const paginationOpts = pagination || { page: 1, limit: 20 };
        
        // Pour simplifier, on recupere tous puis on pagine
        // A optimiser avec une vraie requete paginee
        let etages = await this.etageRepository.findAll();

        // Appliquer les filtres
        if (filters) {
            if (filters.batimentId) {
                etages = etages.filter(e => e.batimentId === filters.batimentId);
            }
            if (filters.actif !== undefined) {
                etages = etages.filter(e => e.actif === filters.actif);
            }
            if (filters.numeroMin !== undefined) {
                etages = etages.filter(e => e.numero >= filters.numeroMin!);
            }
            if (filters.numeroMax !== undefined) {
                etages = etages.filter(e => e.numero <= filters.numeroMax!);
            }
        }

        const total = etages.length;
        const totalPages = Math.ceil(total / paginationOpts.limit);
        const start = (paginationOpts.page - 1) * paginationOpts.limit;
        const paginatedEtages = etages.slice(start, start + paginationOpts.limit);

        return {
            data: this.etageMapper.toListDtos(paginatedEtages),
            total,
            page: paginationOpts.page,
            limit: paginationOpts.limit,
            totalPages,
            hasNextPage: paginationOpts.page < totalPages,
            hasPreviousPage: paginationOpts.page > 1,
        };
    }

    /**
     * Met a jour un etage
     */
    async update(id: string, dto: UpdateEtageDto): Promise<EtageDetailResponseDto> {
        const etage = await this.etageRepository.findById(id);
        if (!etage) {
            throw new NotFoundException(`Etage avec l'ID '${id}' non trouve`);
        }

        // Mettre a jour via la methode de l'entite
        etage.update({
            designation: dto.designation,
            superficie: dto.superficie,
            planEtage: dto.planEtage,
        });

        const updatedEtage = await this.etageRepository.save(etage);

        // Emettre l'evenement
        this.eventEmitter.emit('etage.updated', {
            etageId: updatedEtage.id,
            batimentId: updatedEtage.batimentId,
        });

        return this.etageMapper.toDetailDto(updatedEtage);
    }

    /**
     * Desactive un etage (soft delete)
     */
    async desactiver(id: string): Promise<void> {
        const etage = await this.etageRepository.findById(id);
        if (!etage) {
            throw new NotFoundException(`Etage avec l'ID '${id}' non trouve`);
        }

        if (!etage.actif) {
            throw new BadRequestException('Cet etage est deja desactive');
        }

        // Verifier qu'il n'y a pas d'espaces actifs
        const espaces = await this.espaceRepository.findActifsByEtage(id);
        if (espaces.length > 0) {
            throw new BadRequestException(
                `Impossible de desactiver cet etage : ${espaces.length} espace(s) actif(s)`,
            );
        }

        etage.desactiver();
        await this.etageRepository.save(etage);

        // Emettre l'evenement
        this.eventEmitter.emit('etage.deactivated', {
            etageId: id,
            batimentId: etage.batimentId,
        });
    }

    /**
     * Reactive un etage
     */
    async reactiver(id: string): Promise<EtageDetailResponseDto> {
        const etage = await this.etageRepository.findById(id);
        if (!etage) {
            throw new NotFoundException(`Etage avec l'ID '${id}' non trouve`);
        }

        if (etage.actif) {
            throw new BadRequestException('Cet etage est deja actif');
        }

        // Verifier que le batiment parent est actif
        const batiment = await this.batimentRepository.findById(etage.batimentId);
        if (!batiment || !batiment.actif) {
            throw new BadRequestException(
                'Impossible de reactiver cet etage : le batiment parent est inactif',
            );
        }

        etage.reactiver();
        const updatedEtage = await this.etageRepository.save(etage);

        // Emettre l'evenement
        this.eventEmitter.emit('etage.reactivated', {
            etageId: id,
            batimentId: etage.batimentId,
        });

        return this.etageMapper.toDetailDto(updatedEtage);
    }

    /**
     * Supprime definitivement un etage
     */
    async delete(id: string): Promise<void> {
        const etage = await this.etageRepository.findById(id);
        if (!etage) {
            throw new NotFoundException(`Etage avec l'ID '${id}' non trouve`);
        }

        // Verifier qu'il n'y a pas d'espaces
        const espaces = await this.espaceRepository.findByEtageId(id);
        if (espaces.length > 0) {
            throw new BadRequestException(
                'Impossible de supprimer un etage contenant des espaces. ' +
                'Supprimez d\'abord tous les espaces.',
            );
        }

        await this.etageRepository.delete(id);

        // Mettre a jour le nombre d'etages du batiment
        const batiment = await this.batimentRepository.findById(etage.batimentId);
        if (batiment) {
            const etagesCount = await this.etageRepository.countByBatiment(etage.batimentId);
            if (etagesCount < batiment.nombreEtages) {
                batiment.update({ nombreEtages: etagesCount });
                await this.batimentRepository.save(batiment);
            }
        }

        // Emettre l'evenement
        this.eventEmitter.emit('etage.deleted', {
            etageId: id,
            batimentId: etage.batimentId,
        });
    }

    /**
     * Recupere les statistiques d'un etage
     */
    async getStatistiques(id: string): Promise<EtageWithStatsResponseDto> {
        return this.findByIdWithStats(id);
    }

    /**
     * Recupere les statistiques de tous les etages d'un batiment
     */
    async getStatistiquesParBatiment(
        batimentId: string,
    ): Promise<EtageWithStatsResponseDto[]> {
        const etages = await this.etageRepository.findActifsByBatiment(batimentId);
        
        return Promise.all(
            etages.map(async etage => {
                const stats = await this.etageRepository.getStats(etage.id);
                if (!stats) {
                    throw new NotFoundException(`Statistiques non trouvees pour l'etage '${etage.id}'`);
                }
                return this.etageMapper.toWithStatsDto(etage, stats);
            }),
        );
    }
}