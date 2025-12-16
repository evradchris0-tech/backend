// services/equipment-service/database/migrations/1734365600000-CreateMaintenanceHistoryTable.ts

import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateMaintenanceHistoryTable1734365600000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'maintenance_history',
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
                        name: 'incident_id',
                        type: 'varchar',
                        length: '255',
                        isNullable: true,
                        comment: 'Lié à un incident si maintenance corrective',
                    },
                    {
                        name: 'type',
                        type: 'varchar',
                        length: '50',
                        isNullable: false,
                        comment: 'PREVENTIVE, CORRECTIVE, PREDICTIVE, EMERGENCY',
                    },
                    {
                        name: 'description',
                        type: 'text',
                        isNullable: false,
                    },
                    {
                        name: 'performed_by',
                        type: 'varchar',
                        length: '255',
                        isNullable: false,
                    },
                    {
                        name: 'performed_at',
                        type: 'timestamp',
                        isNullable: false,
                    },
                    {
                        name: 'duration',
                        type: 'int',
                        isNullable: false,
                        comment: 'Durée en minutes',
                    },
                    {
                        name: 'cost',
                        type: 'decimal',
                        precision: 10,
                        scale: 2,
                        isNullable: true,
                    },
                    {
                        name: 'spare_parts',
                        type: 'jsonb',
                        isNullable: true,
                    },
                    {
                        name: 'before_condition',
                        type: 'varchar',
                        length: '50',
                        isNullable: false,
                    },
                    {
                        name: 'after_condition',
                        type: 'varchar',
                        length: '50',
                        isNullable: false,
                    },
                    {
                        name: 'notes',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'photos',
                        type: 'jsonb',
                        isNullable: true,
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
            'maintenance_history',
            new TableIndex({
                name: 'IDX_maintenance_equipment',
                columnNames: ['equipment_id'],
            }),
        );

        // Index sur incident_id
        await queryRunner.createIndex(
            'maintenance_history',
            new TableIndex({
                name: 'IDX_maintenance_incident',
                columnNames: ['incident_id'],
            }),
        );

        // Index sur performed_at
        await queryRunner.createIndex(
            'maintenance_history',
            new TableIndex({
                name: 'IDX_maintenance_date',
                columnNames: ['performed_at'],
            }),
        );

        // Index sur type
        await queryRunner.createIndex(
            'maintenance_history',
            new TableIndex({
                name: 'IDX_maintenance_type',
                columnNames: ['type'],
            }),
        );

        // Foreign Key vers equipments
        await queryRunner.createForeignKey(
            'maintenance_history',
            new TableForeignKey({
                columnNames: ['equipment_id'],
                referencedTableName: 'equipments',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('maintenance_history');
    }
}