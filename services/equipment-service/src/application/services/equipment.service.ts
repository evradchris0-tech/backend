import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IEquipmentRepository } from '../../domain/repositories/equipment.repository.interface';
import { ITransferRepository } from '../../domain/repositories/transfer.repository.interface';
import { EquipmentFactory } from '../../domain/factories/equipment.factory';
import { CreateEquipmentDto } from '../dtos/create-equipment.dto';
import { MoveEquipmentDto } from '../dtos/move-equipment.dto';
import { EquipmentResponseDto } from '../dtos/equipment-response.dto';
import { EquipmentMapper } from '../mappers/equipment.mapper';
import { EquipmentTransferEntity } from '../../domain/entities/equipment-transfer.entity';
import { EquipmentStatus } from '../../domain/enums/equipment-status.enum';

@Injectable()
export class EquipmentService {
    constructor(
        @Inject('IEquipmentRepository')
        private readonly equipmentRepo: IEquipmentRepository,
        @Inject('ITransferRepository')
        private readonly transferRepo: ITransferRepository,
        private readonly equipmentFactory: EquipmentFactory, // Injection de la Factory
    ) { }

    /**
     * CRÉATION INTELLIGENTE
     * Utilise la Factory pour générer le code unique (LIT-006)
     */
    async create(dto: CreateEquipmentDto): Promise<EquipmentResponseDto> {
        // 1. Déléguer la logique de création complexe à la Factory
        const equipmentEntity = await this.equipmentFactory.createFromDto(dto);

        // 2. Sauvegarder
        const savedEquipment = await this.equipmentRepo.save(equipmentEntity);

        // 3. Si un espace initial est défini, créer le premier log de transfert (Installation)
        if (dto.spaceId) {
            const transfer = new EquipmentTransferEntity();
            transfer.equipment = savedEquipment;
            transfer.fromSpaceId = null; // Vient du stock/néant
            transfer.toSpaceId = dto.spaceId;
            transfer.performedBy = 'SYSTEM_INIT'; // Ou l'ID de l'admin créateur si dispo
            transfer.reason = 'Installation initiale';
            transfer.transferDate = new Date();
            await this.transferRepo.save(transfer);
        }

        return EquipmentMapper.toDto(savedEquipment);
    }

    /**
     * GESTION DES MOUVEMENTS (Traçabilité)
     * Déplace un équipement et crée l'historique automatiquement.
     */
    async move(dto: MoveEquipmentDto): Promise<EquipmentResponseDto> {
        // 1. Récupérer l'équipement
        const equipment = await this.equipmentRepo.findById(dto.equipmentId);
        if (!equipment) {
            throw new NotFoundException(`Equipment with ID ${dto.equipmentId} not found`);
        }

        // 2. Préparer le log de transfert AVANT modification
        const transfer = new EquipmentTransferEntity();
        transfer.equipment = equipment;
        transfer.fromSpaceId = equipment.spaceId; // L'ancien emplacement
        transfer.toSpaceId = dto.targetSpaceId || null;
        transfer.performedBy = dto.performedBy;
        transfer.reason = dto.reason || 'Mouvement standard';
        transfer.transferDate = new Date();

        // 3. Appliquer le mouvement sur l'équipement
        equipment.spaceId = dto.targetSpaceId || null; // Si null => Retour en stock

        // Mise à jour automatique du statut
        if (equipment.spaceId) {
            equipment.status = EquipmentStatus.ASSIGNED;
        } else {
            equipment.status = EquipmentStatus.IN_STOCK;
        }

        // 4. Sauvegarder (Idéalement dans une transaction, ici séquentiel pour MVP)
        await this.transferRepo.save(transfer);
        const updatedEquipment = await this.equipmentRepo.save(equipment);

        return EquipmentMapper.toDto(updatedEquipment);
    }

    async findOne(id: string): Promise<EquipmentResponseDto> {
        const equipment = await this.equipmentRepo.findById(id);
        if (!equipment) throw new NotFoundException('Equipment not found');
        return EquipmentMapper.toDto(equipment);
    }

    // Pour la Sidebar BabylonJS (Contenu d'une pièce)
    async findBySpace(spaceId: string): Promise<EquipmentResponseDto[]> {
        const equipments = await this.equipmentRepo.findBySpaceId(spaceId);
        return EquipmentMapper.toDtoList(equipments);
    }

    async findAll(): Promise<EquipmentResponseDto[]> {
        // TODO: Ajouter pagination
        const equipments = await this.equipmentRepo.findAll({ skip: 0, take: 100 });
        return EquipmentMapper.toDtoList(equipments);
    }

    async remove(id: string): Promise<void> {
        const equipment = await this.equipmentRepo.findById(id);
        if (!equipment) throw new NotFoundException('Equipment not found');
        // Suppression logique ou physique selon les besoins (ici physique pour MVP)
        // Implémenter la suppression dans le repository si nécessaire
        // await this.equipmentRepo.delete(id);
        throw new Error('Delete method not implemented yet.');
    }
}