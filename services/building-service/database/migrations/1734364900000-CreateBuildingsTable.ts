// services/building-service/database/migrations/1734364900000-CreateBuildingsTable.ts

import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableIndex,
    TableForeignKey
} from 'typeorm';

export class CreateBuildingsTable1734364900000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'buildings',
                columns: [
                    {
                        name: 'id',
                        type: 'varchar',
                        length: '255',
                        isPrimary: true,
                    },
                    {
                        name: 'site_id',
                        type: 'varchar',
                        length: '255',
                        isNullable: false,
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
                    },
                    {
                        name: 'type',
                        type: 'varchar',
                        length: '50',
                        isNullable: false,
                    },
                    {
                        name: 'floors_count',
                        type: 'int',
                        default: 0,
                    },
                    {
                        name: 'total_capacity',
                        type: 'int',
                        isNullable: true,
                    },
                    {
                        name: 'status',
                        type: 'varchar',
                        length: '50',
                        default: "'ACTIVE'",
                    },
                    {
                        name: 'location_data',
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

        // Index unique : code + site_id
        await queryRunner.createIndex(
            'buildings',
            new TableIndex({
                name: 'IDX_buildings_code_site',
                columnNames: ['code', 'site_id'],
                isUnique: true,
            }),
        );

        // Index sur site_id pour les requêtes
        await queryRunner.createIndex(
            'buildings',
            new TableIndex({
                name: 'IDX_buildings_site_id',
                columnNames: ['site_id'],
            }),
        );

        // Index sur status
        await queryRunner.createIndex(
            'buildings',
            new TableIndex({
                name: 'IDX_buildings_status',
                columnNames: ['status'],
            }),
        );

        // Foreign Key vers sites
        await queryRunner.createForeignKey(
            'buildings',
            new TableForeignKey({
                columnNames: ['site_id'],
                referencedTableName: 'sites',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('buildings');
    }
}