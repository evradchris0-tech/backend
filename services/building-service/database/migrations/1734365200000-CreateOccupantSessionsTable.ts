// services/building-service/database/migrations/1734365200000-CreateOccupantSessionsTable.ts

import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableIndex,
    TableForeignKey,
    TableCheck
} from 'typeorm';

export class CreateOccupantSessionsTable1734365200000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'occupant_sessions',
                columns: [
                    {
                        name: 'id',
                        type: 'varchar',
                        length: '255',
                        isPrimary: true,
                    },
                    {
                        name: 'space_id',
                        type: 'varchar',
                        length: '255',
                        isNullable: false,
                    },
                    {
                        name: 'occupant_id',
                        type: 'varchar',
                        length: '255',
                        isNullable: false,
                    },
                    {
                        name: 'start_date',
                        type: 'date',
                        isNullable: false,
                    },
                    {
                        name: 'end_date',
                        type: 'date',
                        isNullable: false,
                    },
                    {
                        name: 'status',
                        type: 'varchar',
                        length: '50',
                        default: "'ACTIVE'",
                    },
                    {
                        name: 'session_type',
                        type: 'varchar',
                        length: '50',
                        isNullable: false,
                    },
                    {
                        name: 'contract_ref',
                        type: 'varchar',
                        length: '100',
                        isNullable: true,
                    },
                    {
                        name: 'monthly_rent',
                        type: 'decimal',
                        precision: 10,
                        scale: 2,
                        isNullable: true,
                    },
                    {
                        name: 'deposit',
                        type: 'decimal',
                        precision: 10,
                        scale: 2,
                        isNullable: true,
                    },
                    {
                        name: 'notes',
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

        // Contrainte CHECK : end_date > start_date
        await queryRunner.createCheckConstraint(
            'occupant_sessions',
            new TableCheck({
                name: 'CHK_sessions_dates',
                expression: '"end_date" > "start_date"',
            }),
        );

        // Index sur space_id
        await queryRunner.createIndex(
            'occupant_sessions',
            new TableIndex({
                name: 'IDX_sessions_space_id',
                columnNames: ['space_id'],
            }),
        );

        // Index sur occupant_id
        await queryRunner.createIndex(
            'occupant_sessions',
            new TableIndex({
                name: 'IDX_sessions_occupant_id',
                columnNames: ['occupant_id'],
            }),
        );

        // Index sur status
        await queryRunner.createIndex(
            'occupant_sessions',
            new TableIndex({
                name: 'IDX_sessions_status',
                columnNames: ['status'],
            }),
        );

        // Index sur dates (pour requêtes d'expiration)
        await queryRunner.createIndex(
            'occupant_sessions',
            new TableIndex({
                name: 'IDX_sessions_dates',
                columnNames: ['start_date', 'end_date'],
            }),
        );

        // Foreign Key vers spaces
        await queryRunner.createForeignKey(
            'occupant_sessions',
            new TableForeignKey({
                columnNames: ['space_id'],
                referencedTableName: 'spaces',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('occupant_sessions');
    }
}