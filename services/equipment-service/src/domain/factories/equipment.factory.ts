import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { EquipmentEntity } from '../entities/equipment.entity';
import { CreateEquipmentDto } from '../../application/dtos/create-equipment.dto';
import { IEquipmentCategoryRepository } from '../repositories/equipment-category.repository.interface';
import { EquipmentStatus } from '../enums/equipment-status.enum';
import { EquipmentCondition } from '../enums/equipment-condition.enum';

@Injectable()
export class EquipmentFactory {
    constructor(
        @Inject('IEquipmentCategoryRepository')
        private readonly categoryRepo: IEquipmentCategoryRepository,
    ) { }

    /**
     * Crée une instance d'équipement avec un CODE unique auto-généré.
     * Gère la transaction implicite via le repository.
     */
    async createFromDto(dto: CreateEquipmentDto): Promise<EquipmentEntity> {
        // 1. Récupérer la catégorie pour avoir le code parent (ex: "LIT")
        const category = await this.categoryRepo.findById(dto.categoryId);
        if (!category) {
            throw new NotFoundException(`Category with ID ${dto.categoryId} not found`);
        }

        // 2. Incrémenter le compteur de manière atomique (Critical Section)
        // Retourne le nouveau numéro (ex: 6)
        const newSequence = await this.categoryRepo.incrementSequence(category.id);

        // 3. Générer le code intelligent
        // Format : CODE_CATEGORIE + "-" + SEQUENCE_PADDÉE (3 chiffres)
        // Ex: LIT-006
        const paddedSequence = newSequence.toString().padStart(3, '0');
        const generatedCode = `${category.code}-${paddedSequence}`;

        // 4. Instancier l'entité
        const equipment = new EquipmentEntity();

        // Identité & Code
        equipment.name = dto.name;
        equipment.code = generatedCode; // <-- Le code généré
        equipment.categoryId = dto.categoryId;
        equipment.serialNumber = dto.serialNumber;

        // État initial
        equipment.status = dto.status || EquipmentStatus.IN_STOCK;
        equipment.condition = dto.condition || EquipmentCondition.NEW;

        // Localisation (Soft Link)
        equipment.spaceId = dto.spaceId || null;
        if (equipment.spaceId) {
            // Si on l'assigne directement à un espace, le statut change
            equipment.status = EquipmentStatus.ASSIGNED;
        }

        // Données financières
        equipment.purchasePrice = dto.purchasePrice;
        if (dto.purchaseDate) equipment.purchaseDate = new Date(dto.purchaseDate);
        if (dto.warrantyEndDate) equipment.warrantyEndDate = new Date(dto.warrantyEndDate);

        // Médias
        equipment.imageUrls = dto.imageUrls || [];
        equipment.metadata = dto.metadata || {};

        return equipment;
    }
}