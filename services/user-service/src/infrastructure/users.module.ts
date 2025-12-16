import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { UserSchema } from './persistence/schemas/user.schema';
import { UsersController } from './http/controllers/users.controller';
import { ExcelImportController } from './http/controllers/excel-import.controller';

import { CreateUserUseCase } from '../application/use-cases/users/create-user.use-case';
import { UpdateUserUseCase } from '../application/use-cases/users/update-user.use-case';
import { DeleteUserUseCase } from '../application/use-cases/users/delete-user.use-case';
import { GetUsersUseCase } from '../application/use-cases/users/get-users.use-case';
import { GetUserByIdUseCase } from '../application/use-cases/users/get-user-by-id.use-case';
import { AssignRoomUseCase } from '../application/use-cases/users/assign-room.use-case';
import { ImportOccupantsUseCase } from '../application/use-cases/users/import-occupants.use-case';

import { TypeOrmUserRepository } from './persistence/repositories/typeorm-user.repository';
import { IUserRepository } from '../domain/repositories/user.repository.interface';

import { EmailService } from '../application/services/email.service';
import { ExcelService } from '../application/services/excel.service';
import { ExcelImportService } from '../application/services/excel-import.service';
import { UserDomainEventPublisher } from '../application/services/user-domain-event-publisher.service';
import { PasswordService } from '../application/services/password.service';
import { EncryptionService } from '../application/services/encryption.service';

import { RabbitMQPublisherService } from './events/rabbitmq-publisher.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([UserSchema]),
        PassportModule,
        ConfigModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: { expiresIn: configService.get<string>('JWT_EXPIRATION', '2h') },
            }),
        }),
    ],
    controllers: [UsersController, ExcelImportController],
    providers: [
        // Use-cases
        CreateUserUseCase,
        UpdateUserUseCase,
        DeleteUserUseCase,
        GetUsersUseCase,
        GetUserByIdUseCase,
        AssignRoomUseCase,
        ImportOccupantsUseCase,

        // Repository binding (DDD)
        {
            provide: 'IUserRepository',
            useClass: TypeOrmUserRepository,
        },
        // Application services
        EmailService,
        ExcelService,
        ExcelImportService,
        UserDomainEventPublisher,
        PasswordService,
        EncryptionService,

        // Infrastructure / crosscutting
        RabbitMQPublisherService,
    ],
    exports: [
        RabbitMQPublisherService,
        // Exporter le repository si d'autres modules l'utilisent
        { provide: 'IUserRepository', useClass: TypeOrmUserRepository },
    ],
})
export class UsersModule {}
