import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateOperationLogsTable1702200000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'operation_logs',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                    },
                    {
                        name: 'eventId',
                        type: 'uuid',
                        isNullable: false,
                    },
                    {
                        name: 'eventType',
                        type: 'varchar',
                        isNullable: false,
                    },
                    {
                        name: 'operationType',
                        type: 'varchar',
                        isNullable: false,
                    },
                    {
                        name: 'sourceService',
                        type: 'varchar',
                        isNullable: false,
                    },
                    {
                        name: 'targetServices',
                        type: 'text',
                        isNullable: false,
                    },
                    {
                        name: 'entityType',
                        type: 'varchar',
                        isNullable: false,
                    },
                    {
                        name: 'entityId',
                        type: 'varchar',
                        isNullable: false,
                    },
                    {
                        name: 'status',
                        type: 'varchar',
                        isNullable: false,
                    },
                    {
                        name: 'duration',
                        type: 'integer',
                        isNullable: false,
                    },
                    {
                        name: 'errorMessage',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'retryCount',
                        type: 'integer',
                        default: 0,
                        isNullable: false,
                    },
                    {
                        name: 'createdAt',
                        type: 'timestamp',
                        default: 'now()',
                        isNullable: false,
                    },
                    {
                        name: 'timestamp',
                        type: 'timestamp',
                        isNullable: false,
                    },
                    {
                        name: 'userId',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'metadata',
                        type: 'jsonb',
                        isNullable: true,
                    },
                    {
                        name: 'ipAddress',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'userAgent',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'traceId',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'isSyncedToRedis',
                        type: 'boolean',
                        default: false,
                        isNullable: false,
                    },
                ],
            }),
            true,
        );

        // Indices pour performances
        await queryRunner.createIndex(
            'operation_logs',
            new TableIndex({
                name: 'IDX_operation_logs_timestamp',
                columnNames: ['timestamp'],
            }),
        );

        await queryRunner.createIndex(
            'operation_logs',
            new TableIndex({
                name: 'IDX_operation_logs_status',
                columnNames: ['status'],
            }),
        );

        await queryRunner.createIndex(
            'operation_logs',
            new TableIndex({
                name: 'IDX_operation_logs_entityId',
                columnNames: ['entityId'],
            }),
        );

        await queryRunner.createIndex(
            'operation_logs',
            new TableIndex({
                name: 'IDX_operation_logs_eventId',
                columnNames: ['eventId'],
            }),
        );

        await queryRunner.createIndex(
            'operation_logs',
            new TableIndex({
                name: 'IDX_operation_logs_sourceService',
                columnNames: ['sourceService'],
            }),
        );

        await queryRunner.createIndex(
            'operation_logs',
            new TableIndex({
                name: 'IDX_operation_logs_operationType',
                columnNames: ['operationType'],
            }),
        );

        await queryRunner.createIndex(
            'operation_logs',
            new TableIndex({
                name: 'IDX_operation_logs_status_timestamp',
                columnNames: ['status', 'timestamp'],
            }),
        );

        await queryRunner.createIndex(
            'operation_logs',
            new TableIndex({
                name: 'IDX_operation_logs_entityType_entityId',
                columnNames: ['entityType', 'entityId'],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('operation_logs');
    }
}
