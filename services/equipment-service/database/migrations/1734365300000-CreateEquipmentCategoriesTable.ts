// services/equipment-service/database/migrations/1734365300000-CreateEquipmentCategoriesTable.ts

import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateEquipmentCategoriesTable1734365300000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'equipment_categories',
                columns: [
                    {
                        name: 'id',
                        type: 'varchar',
                        length: '255',
                        isPrimary: true,
                    },
                    {
                        name: 'name',
                        type: 'varchar',
                        length: '255',
                        isNullable: false,
                    },
                    {
                        name: 'code',
                        type: 'varchar',
                        length: '50',
                        isNullable: false,
                        isUnique: true,
                    },
                    {
                        name: 'description',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'parent_category_id',
                        type: 'varchar',
                        length: '255',
                        isNullable: true,
                    },
                    {
                        name: 'icon_url',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'last_sequence_number',
                        type: 'int',
                        default: 0,
                        isNullable: false,
                    },
                    {
                        name: 'maintenance_interval',
                        type: 'int',
                        isNullable: true,
                        comment: 'Intervalle de maintenance en jours',
                    },
                    {
                        name: 'criticality',
                        type: 'varchar',
                        length: '50',
                        default: "'MEDIUM'",
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
            'equipment_categories',
            new TableIndex({
                name: 'IDX_categories_code',
                columnNames: ['code'],
                isUnique: true,
            }),
        );

        // Index sur parent_category_id pour hiérarchie
        await queryRunner.createIndex(
            'equipment_categories',
            new TableIndex({
                name: 'IDX_categories_parent',
                columnNames: ['parent_category_id'],
            }),
        );

        // Foreign Key auto-référencée (hiérarchie)
        await queryRunner.createForeignKey(
            'equipment_categories',
            new TableForeignKey({
                columnNames: ['parent_category_id'],
                referencedTableName: 'equipment_categories',
                referencedColumnNames: ['id'],
                onDelete: 'SET NULL',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('equipment_categories');
    }
}