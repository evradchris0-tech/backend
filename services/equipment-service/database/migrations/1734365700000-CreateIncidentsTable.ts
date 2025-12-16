// services/equipment-service/database/migrations/1734365700000-CreateIncidentsTable.ts

import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateIncidentsTable1734365700000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'incidents',
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
                        name: 'space_id',
                        type: 'varchar',
                        length: '255',
                        isNullable: false,
                        comment: 'Soft FK vers building-service',
                    },
                    {
                        name: 'building_id',
                        type: 'varchar',
                        length: '255',
                        isNullable: false,
                        comment: 'Denormalized',
                    },
                    {
                        name: 'reported_by',
                        type: 'varchar',
                        length: '255',
                        isNullable: false,
                        comment: 'User ID',
                    },
                    {
                        name: 'assigned_to',
                        type: 'varchar',
                        length: '255',
                        isNullable: true,
                        comment: 'Agent ID',
                    },
                    {
                        name: 'title',
                        type: 'varchar',
                        length: '255',
                        isNullable: false,
                    },
                    {
                        name: 'description',
                        type: 'text',
                        isNullable: false,
                    },
                    {
                        name: 'priority',
                        type: 'varchar',
                        length: '50',
                        isNullable: false,
                    },
                    {
                        name: 'status',
                        type: 'varchar',
                        length: '50',
                        isNullable: false,
                        default: "'OPEN'",
                    },
                    {
                        name: 'category',
                        type: 'varchar',
                        length: '50',
                        isNullable: false,
                    },
                    {
                        name: 'photos',
                        type: 'jsonb',
                        isNullable: true,
                    },
                    {
                        name: 'reported_at',
                        type: 'timestamp',
                        isNullable: false,
                    },
                    {
                        name: 'acknowledged_at',
                        type: 'timestamp',
                        isNullable: true,
                    },
                    {
                        name: 'started_at',
                        type: 'timestamp',
                        isNullable: true,
                    },
                    {
                        name: 'resolved_at',
                        type: 'timestamp',
                        isNullable: true,
                    },
                    {
                        name: 'closed_at',
                        type: 'timestamp',
                        isNullable: true,
                    },
                    {
                        name: 'resolution',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'estimated_duration',
                        type: 'int',
                        isNullable: true,
                        comment: 'En minutes',
                    },
                    {
                        name: 'actual_duration',
                        type: 'int',
                        isNullable: true,
                        comment: 'En minutes',
                    },
                    {
                        name: 'sla_deadline',
                        type: 'timestamp',
                        isNullable: true,
                    },
                    {
                        name: 'metadata',
                        type: 'jsonb',
                        isNullable: true,
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                ],
            }),
            true,
        );

        // Index sur equipment_id
        await queryRunner.createIndex(
            'incidents',
            new TableIndex({
                name: 'IDX_incidents_equipment',
                columnNames: ['equipment_id'],
            }),
        );

        // Index sur space_id
        await queryRunner.createIndex(
            'incidents',
            new TableIndex({
                name: 'IDX_incidents_space',
                columnNames: ['space_id'],
            }),
        );

        // Index sur building_id
        await queryRunner.createIndex(
            'incidents',
            new TableIndex({
                name: 'IDX_incidents_building',
                columnNames: ['building_id'],
            }),
        );

        // Index sur reported_by
        await queryRunner.createIndex(
            'incidents',
            new TableIndex({
                name: 'IDX_incidents_reported_by',
                columnNames: ['reported_by'],
            }),
        );

        // Index sur assigned_to
        await queryRunner.createIndex(
            'incidents',
            new TableIndex({
                name: 'IDX_incidents_assigned_to',
                columnNames: ['assigned_to'],
            }),
        );

        // Index sur status + priority (requêtes fréquentes)
        await queryRunner.createIndex(
            'incidents',
            new TableIndex({
                name: 'IDX_incidents_status_priority',
                columnNames: ['status', 'priority'],
            }),
        );

        // Index sur sla_deadline (alertes SLA)
        await queryRunner.createIndex(
            'incidents',
            new TableIndex({
                name: 'IDX_incidents_sla',
                columnNames: ['sla_deadline'],
            }),
        );

        // Index sur reported_at
        await queryRunner.createIndex(
            'incidents',
            new TableIndex({
                name: 'IDX_incidents_reported_at',
                columnNames: ['reported_at'],
            }),
        );

        // Foreign Key vers equipments
        await queryRunner.createForeignKey(
            'incidents',
            new TableForeignKey({
                columnNames: ['equipment_id'],
                referencedTableName: 'equipments',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('incidents');
    }
}