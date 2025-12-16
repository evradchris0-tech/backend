// services/equipment-service/database/migrations/1734365500000-CreateEquipmentTransfersTable.ts

import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateEquipmentTransfersTable1734365500000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'equipment_transfers',
                columns: [
                    {
                        name: 'id',
                        type: 'varchar',
                        length: '255',
                        isPrimary: true,
                    },
                    {
                        name: 'equipment_id',
                        type: 'varchar',
                        length: '255',
                        isNullable: false,
                    },
                    {
                        name: 'from_space_id',
                        type: 'varchar',
                        length: '255',
                        isNullable: true,
                        comment: 'NULL si provenance stock',
                    },
                    {
                        name: 'to_space_id',
                        type: 'varchar',
                        length: '255',
                        isNullable: true,
                        comment: 'NULL si retour en stock',
                    },
                    {
                        name: 'performed_by',
                        type: 'varchar',
                        length: '255',
                        isNullable: false,
                        comment: 'User ID de l\'agent',
                    },
                    {
                        name: 'reason',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'transfer_date',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                ],
            }),
            true,
        );

        // Index sur equipment_id
        await queryRunner.createIndex(
            'equipment_transfers',
            new TableIndex({
                name: 'IDX_transfers_equipment',
                columnNames: ['equipment_id'],
            }),
        );

        // Index sur transfer_date (chronologie)
        await queryRunner.createIndex(
            'equipment_transfers',
            new TableIndex({
                name: 'IDX_transfers_date',
                columnNames: ['transfer_date'],
            }),
        );

        // Index sur performed_by
        await queryRunner.createIndex(
            'equipment_transfers',
            new TableIndex({
                name: 'IDX_transfers_performed_by',
                columnNames: ['performed_by'],
            }),
        );

        // Foreign Key vers equipments
        await queryRunner.createForeignKey(
            'equipment_transfers',
            new TableForeignKey({
                columnNames: ['equipment_id'],
                referencedTableName: 'equipments',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('equipment_transfers');
    }
}