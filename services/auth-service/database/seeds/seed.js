"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const config_1 = require("@nestjs/config");
const dotenv_1 = require("dotenv");
const create_admin_seed_1 = require("./create-admin.seed");
(0, dotenv_1.config)();
const configService = new config_1.ConfigService();
const AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: configService.get('DB_HOST'),
    port: configService.get('DB_PORT'),
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    database: configService.get('DB_DATABASE'),
    entities: [__dirname + '/../../src/**/*.schema{.ts,.js}'],
    synchronize: false,
});
async function runSeeds() {
    try {
        console.log('🌱 Starting database seeding...');
        await AppDataSource.initialize();
        console.log('✅ Database connection established');
        await (0, create_admin_seed_1.createSuperAdmin)(AppDataSource);
        await AppDataSource.destroy();
        console.log('✅ Seeding completed successfully');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}
runSeeds();
//# sourceMappingURL=seed.js.map