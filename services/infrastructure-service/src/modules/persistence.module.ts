// src/modules/persistence.module.ts

import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities ORM
import {
    BatimentOrmEntity,
    EtageOrmEntity,
    EspaceOrmEntity,
    EquipementOrmEntity,
} from '../infrastructure/persistence/entities';

// ORM Mappers
import {
    BatimentOrmMapper,
    EtageOrmMapper,
    EspaceOrmMapper,
    EquipementOrmMapper,
} from '../infrastructure/persistence/mappers';

// Repository Implementations
import {
    BatimentRepository,
    EtageRepository,
    EspaceRepository,
    EquipementRepository,
} from '../infrastructure/persistence/repositories';

/**
 * Module de persistence - gere l'acces aux donnees
 * Exporte les repositories pour injection dans les services applicatifs
 */
@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([
            BatimentOrmEntity,
            EtageOrmEntity,
            EspaceOrmEntity,
            EquipementOrmEntity,
        ]),
    ],
    providers: [
        // ORM Mappers
        BatimentOrmMapper,
        EtageOrmMapper,
        EspaceOrmMapper,
        EquipementOrmMapper,

        // Repository Implementations avec injection par token
        {
            provide: 'IBatimentRepository',
            useClass: BatimentRepository,
        },
        {
            provide: 'IEtageRepository',
            useClass: EtageRepository,
        },
        {
            provide: 'IEspaceRepository',
            useClass: EspaceRepository,
        },
        {
            provide: 'IEquipementRepository',
            useClass: EquipementRepository,
        },

        // Repositories concrets pour injection directe
        BatimentRepository,
        EtageRepository,
        EspaceRepository,
        EquipementRepository,
    ],
    exports: [
        'IBatimentRepository',
        'IEtageRepository',
        'IEspaceRepository',
        'IEquipementRepository',
        BatimentRepository,
        EtageRepository,
        EspaceRepository,
        EquipementRepository,
        BatimentOrmMapper,
        EtageOrmMapper,
        EspaceOrmMapper,
        EquipementOrmMapper,
    ],
})
export class PersistenceModule {}