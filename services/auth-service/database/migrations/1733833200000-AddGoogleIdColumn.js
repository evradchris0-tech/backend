"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddGoogleIdColumn1733833200000 = void 0;
const typeorm_1 = require("typeorm");
class AddGoogleIdColumn1733833200000 {
    constructor() {
        this.name = 'AddGoogleIdColumn1733833200000';
    }
    async up(queryRunner) {
        await queryRunner.addColumn('auth_users', new typeorm_1.TableColumn({
            name: 'google_id',
            type: 'varchar',
            length: '255',
            isNullable: true,
            isUnique: true,
        }));
    }
    async down(queryRunner) {
        await queryRunner.dropColumn('auth_users', 'google_id');
    }
}
exports.AddGoogleIdColumn1733833200000 = AddGoogleIdColumn1733833200000;
//# sourceMappingURL=1733833200000-AddGoogleIdColumn.js.map