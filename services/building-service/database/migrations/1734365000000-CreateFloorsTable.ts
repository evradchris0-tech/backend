// services/building-service/database/migrations/1734365000000-CreateFloorsTable.ts

import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableIndex,
    TableForeignKey
} from 'typeorm';

export class CreateFloorsTable1734365000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'floors',
                columns: [
                    {
                        name: 'id',
                        type: 'varchar',
                        length: '255',
                        isPrimary: true,
                    },
                    {
                        name: 'building_id',
                        type: 'varchar',
                        length: '255',
                        isNullable: false,
                    },
                    {
                        name: 'number',
                        type: 'int',
                        isNullable: false,
                    },
                    {
                        name: 'name',
                        type: 'varchar',
                        length: '255',
                        isNullable: true,
                    },
                    {
                        name: 'total_spaces',
                        type: 'int',
                        default: 0,
                    },
                    {
                        name: 'status',
                        type: 'varchar',
                        length: '50',
                        default: "'ACTIVE'",
                    },
                    {
                        name: 'floor_plan_url',
                        type: 'text',
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

        // Index unique : building_id + number
        await queryRunner.createIndex(
            'floors',
            new TableIndex({
                name: 'IDX_floors_building_number',
                columnNames: ['building_id', 'number'],
                isUnique: true,
            }),
        );

        // Index sur building_id
        await queryRunner.createIndex(
            'floors',
            new TableIndex({
                name: 'IDX_floors_building_id',
                columnNames: ['building_id'],
            }),
        );

        // Foreign Key vers buildings
        await queryRunner.createForeignKey(
            'floors',
            new TableForeignKey({
                columnNames: ['building_id'],
                referencedTableName: 'buildings',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('floors');
    }
}