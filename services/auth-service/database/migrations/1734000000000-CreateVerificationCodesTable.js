"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateVerificationCodesTable1734000000000 = void 0;
const typeorm_1 = require("typeorm");
class CreateVerificationCodesTable1734000000000 {
    constructor() {
        this.name = 'CreateVerificationCodesTable1734000000000';
    }
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
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
        }), true);
        await queryRunner.createIndex('verification_codes', new typeorm_1.TableIndex({
            name: 'IDX_verification_codes_email',
            columnNames: ['email'],
        }));
        await queryRunner.createIndex('verification_codes', new typeorm_1.TableIndex({
            name: 'IDX_verification_codes_expires_at',
            columnNames: ['expires_at'],
        }));
    }
    async down(queryRunner) {
        await queryRunner.dropIndex('verification_codes', 'IDX_verification_codes_expires_at');
        await queryRunner.dropIndex('verification_codes', 'IDX_verification_codes_email');
        await queryRunner.dropTable('verification_codes');
    }
}
exports.CreateVerificationCodesTable1734000000000 = CreateVerificationCodesTable1734000000000;
//# sourceMappingURL=1734000000000-CreateVerificationCodesTable.js.map