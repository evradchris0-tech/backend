// services/equipment-service/database/migrations/1734365400000-CreateEquipmentsTable.ts

import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateEquipmentsTable1734365400000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'equipments',
                columns: [
                    {
                        name: 'id',
                        type: 'varchar',
                        length: '255',
                        isPrimary: true,
                    },
                    {
                        name: 'code',
                        type: 'varchar',
                        length: '100',
                        isNullable: false,
                        isUnique: true,
                    },
                    {
                        name: 'name',
                        type: 'varchar',
                        length: '255',
                        isNullable: false,
                    },
                    {
                        name: 'serial_number',
                        type: 'varchar',
                        length: '100',
                        isNullable: true,
                    },
                    {
                        name: 'category_id',
                        type: 'varchar',
                        length: '255',
                        isNullable: false,
                    },
                    {
                        name: 'space_id',
                        type: 'varchar',
                        length: '255',
                        isNullable: true,
                        comment: 'Soft FK vers building-service',
                    },
                    {
                        name: 'building_id',
                        type: 'varchar',
                        length: '255',
                        isNullable: true,
                        comment: 'Denormalized pour requêtes rapides',
                    },
                    {
                        name: 'status',
                        type: 'varchar',
                        length: '50',
                        default: "'IN_STOCK'",
                    },
                    {
                        name: 'condition',
                        type: 'varchar',
                        length: '50',
                        default: "'NEW'",
                    },
                    {
                        name: 'location',
                        type: 'varchar',
                        length: '50',
                        default: "'STORAGE'",
                    },
                    {
                        name: 'purchase_date',
                        type: 'date',
                        isNullable: true,
                    },
                    {
                        name: 'purchase_price',
                        type: 'decimal',
                        precision: 10,
                        scale: 2,
                        isNullable: true,
                    },
                    {
                        name: 'warranty_end_date',
                        type: 'date',
                        isNullable: true,
                    },
                    {
                        name: 'lifespan',
                        type: 'int',
                        isNullable: true,
                        comment: 'Durée de vie estimée en mois',
                    },
                    {
                        name: 'last_maintenance_date',
                        type: 'date',
                        isNullable: true,
                    },
                    {
                        name: 'next_maintenance_date',
                        type: 'date',
                        isNullable: true,
                    },
                    {
                        name: 'image_urls',
                        type: 'jsonb',
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

        // Index unique sur le code
        await queryRunner.createIndex(
            'equipments',
            new TableIndex({
                name: 'IDX_equipments_code',
                columnNames: ['code'],
                isUnique: true,
            }),
        );

        // Index sur category_id
        await queryRunner.createIndex(
            'equipments',
            new TableIndex({
                name: 'IDX_equipments_category',
                columnNames: ['category_id'],
            }),
        );

        // Index sur space_id (soft FK)
        await queryRunner.createIndex(
            'equipments',
            new TableIndex({
                name: 'IDX_equipments_space',
                columnNames: ['space_id'],
            }),
        );

        // Index sur building_id (denormalized)
        await queryRunner.createIndex(
            'equipments',
            new TableIndex({
                name: 'IDX_equipments_building',
                columnNames: ['building_id'],
            }),
        );

        // Index sur status + condition (requêtes fréquentes)
        await queryRunner.createIndex(
            'equipments',
            new TableIndex({
                name: 'IDX_equipments_status_condition',
                columnNames: ['status', 'condition'],
            }),
        );

        // Index sur next_maintenance_date (cron jobs)
        await queryRunner.createIndex(
            'equipments',
            new TableIndex({
                name: 'IDX_equipments_next_maintenance',
                columnNames: ['next_maintenance_date'],
            }),
        );

        // Foreign Key vers equipment_categories
        await queryRunner.createForeignKey(
            'equipments',
            new TableForeignKey({
                columnNames: ['category_id'],
                referencedTableName: 'equipment_categories',
                referencedColumnNames: ['id'],
                onDelete: 'RESTRICT',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('equipments');
    }
}