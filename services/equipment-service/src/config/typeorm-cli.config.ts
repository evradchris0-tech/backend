import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

export default new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5435', 10),
    username: process.env.DB_USERNAME || 'immo360_equipmentdb',
    password: process.env.DB_PASSWORD || 'immo360MSEquipment',
    database: process.env.DB_DATABASE || 'immo360_equipment',

    entities: [__dirname + '/../domain/entities/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../../database/migrations/*{.ts,.js}'],

    synchronize: false,
    logging: true,
});
