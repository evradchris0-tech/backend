// services/building-service/database/migrations/1734365100000-CreateSpacesTable.ts

import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableIndex,
    TableForeignKey
} from 'typeorm';

export class CreateSpacesTable1734365100000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'spaces',
                columns: [
                    {
                        name: 'id',
                        type: 'varchar',
                        length: '255',
                        isPrimary: true,
                    },
                    {
                        name: 'floor_id',
                        type: 'varchar',
                        length: '255',
                        isNullable: false,
                    },
                    {
                        name: 'building_id',
                        type: 'varchar',
                        length: '255',
                        isNullable: false,
                    },
                    {
                        name: 'number',
                        type: 'varchar',
                        length: '50',
                        isNullable: false,
                    },
                    {
                        name: 'name',
                        type: 'varchar',
                        length: '255',
                        isNullable: true,
                    },
                    {
                        name: 'type',
                        type: 'varchar',
                        length: '50',
                        isNullable: false,
                    },
                    {
                        name: 'capacity',
                        type: 'int',
                        default: 1,
                    },
                    {
                        name: 'surface_area',
                        type: 'decimal',
                        precision: 10,
                        scale: 2,
                        isNullable: true,
                    },
                    {
                        name: 'status',
                        type: 'varchar',
                        length: '50',
                        default: "'AVAILABLE'",
                    },
                    {
                        name: 'babylon_config',
                        type: 'jsonb',
                        isNullable: true,
                    },
                    {
                        name: 'features',
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

        // Index unique : floor_id + number
        await queryRunner.createIndex(
            'spaces',
            new TableIndex({
                name: 'IDX_spaces_floor_number',
                columnNames: ['floor_id', 'number'],
                isUnique: true,
            }),
        );

        // Index sur floor_id
        await queryRunner.createIndex(
            'spaces',
            new TableIndex({
                name: 'IDX_spaces_floor_id',
                columnNames: ['floor_id'],
            }),
        );

        // Index sur building_id (denormalized)
        await queryRunner.createIndex(
            'spaces',
            new TableIndex({
                name: 'IDX_spaces_building_id',
                columnNames: ['building_id'],
            }),
        );

        // Index sur type + status (requêtes fréquentes)
        await queryRunner.createIndex(
            'spaces',
            new TableIndex({
                name: 'IDX_spaces_type_status',
                columnNames: ['type', 'status'],
            }),
        );

        // Index GIN sur babylon_config (recherche JSON)
        await queryRunner.query(`
      CREATE INDEX "IDX_spaces_babylon_config" 
      ON "spaces" USING GIN ("babylon_config")
    `);

        // Foreign Key vers floors
        await queryRunner.createForeignKey(
            'spaces',
            new TableForeignKey({
                columnNames: ['floor_id'],
                referencedTableName: 'floors',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
            }),
        );

        // Foreign Key vers buildings
        await queryRunner.createForeignKey(
            'spaces',
            new TableForeignKey({
                columnNames: ['building_id'],
                referencedTableName: 'buildings',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('spaces');
    }
}