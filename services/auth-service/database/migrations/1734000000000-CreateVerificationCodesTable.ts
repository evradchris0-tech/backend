import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateVerificationCodesTable1734000000000 implements MigrationInterface {
    name = 'CreateVerificationCodesTable1734000000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'verification_codes',
                columns: [
                    {
                        name: 'code',
                        type: 'varchar',
                        length: '10',
                        isPrimary: true,
                    },
                    {
                        name: 'email',
                        type: 'varchar',
                        length: '255',
                        isNullable: false,
                    },
                    {
                        name: 'expires_at',
                        type: 'timestamp',
                        isNullable: false,
                    },
                    {
                        name: 'type',
                        type: 'varchar',
                        length: '50',
                        default: "'EMAIL_VERIFICATION'",
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

        // Index sur email pour recherche rapide
        await queryRunner.createIndex(
            'verification_codes',
            new TableIndex({
                name: 'IDX_verification_codes_email',
                columnNames: ['email'],
            }),
        );

        // Index sur expires_at pour le cleanup des codes expirés
        await queryRunner.createIndex(
            'verification_codes',
            new TableIndex({
                name: 'IDX_verification_codes_expires_at',
                columnNames: ['expires_at'],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropIndex('verification_codes', 'IDX_verification_codes_expires_at');
        await queryRunner.dropIndex('verification_codes', 'IDX_verification_codes_email');
        await queryRunner.dropTable('verification_codes');
    }
}