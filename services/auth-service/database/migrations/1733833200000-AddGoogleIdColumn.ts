import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddGoogleIdColumn1733833200000 implements MigrationInterface {
    name = 'AddGoogleIdColumn1733833200000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Ajouter la colonne google_id à la table auth_users
        await queryRunner.addColumn(
            'auth_users',
            new TableColumn({
                name: 'google_id',
                type: 'varchar',
                length: '255',
                isNullable: true,
                isUnique: true,
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Supprimer la colonne en cas de rollback
        await queryRunner.dropColumn('auth_users', 'google_id');
    }
}
