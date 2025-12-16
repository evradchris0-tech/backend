// src/infrastructure/persistence/repositories/typeorm-user.repository.ts

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { UserEntity } from '../../../domain/entities/user.entity';
import { UserSchema } from '../schemas/user.schema';
import { UserMapper } from '../../../application/mappers/user.mapper';

@Injectable()
export class TypeOrmUserRepository implements IUserRepository {
    private readonly logger = new Logger(TypeOrmUserRepository.name);

    constructor(
        @InjectRepository(UserSchema)
        private readonly userRepository: Repository<UserSchema>,
    ) { }

    async findById(id: string): Promise<UserEntity | null> {
        try {
            this.logger.debug(`Finding user by ID: ${id}`);
            
            // Utiliser queryBuilder pour garantir le cast UUID
            const schema = await this.userRepository
                .createQueryBuilder('user')
                .where('user.id = :id', { id })
                .getOne();
            
            if (!schema) {
                this.logger.debug(`User not found: ${id}`);
                return null;
            }
            
            this.logger.debug(`User found: ${schema.email}`);
            return UserMapper.toDomain(schema);
        } catch (error) {
            this.logger.error(`Error finding user by ID ${id}:`, error);
            return null;
        }
    }

    async findByEmail(email: string): Promise<UserEntity | null> {
        try {
            const schema = await this.userRepository
                .createQueryBuilder('user')
                .where('user.email = :email', { email })
                .getOne();
            
            return schema ? UserMapper.toDomain(schema) : null;
        } catch (error) {
            this.logger.error(`Error finding user by email ${email}:`, error);
            return null;
        }
    }

    async save(user: UserEntity): Promise<UserEntity> {
        const schema = UserMapper.toSchema(user);
        const saved = await this.userRepository.save(schema);
        return UserMapper.toDomain(saved);
    }

    async update(user: UserEntity): Promise<UserEntity> {
        const schema = UserMapper.toSchema(user);
        await this.userRepository.update(user.id, schema);
        const updated = await this.userRepository.findOne({ where: { id: user.id } });
        return UserMapper.toDomain(updated!);
    }

    async delete(id: string): Promise<void> {
        await this.userRepository.delete(id);
    }

    async findAllPaginated(
        filters: {
            role?: string;
            status?: string;
            search?: string;
        },
        pagination: {
            skip: number;
            take: number;
        },
    ): Promise<{ users: UserEntity[]; total: number }> {
        const queryBuilder = this.userRepository.createQueryBuilder('user');

        if (filters.role) {
            queryBuilder.andWhere('user.role = :role', { role: filters.role });
        }

        if (filters.status) {
            queryBuilder.andWhere('user.status = :status', { status: filters.status });
        }

        if (filters.search) {
            queryBuilder.andWhere(
                '(user.email ILIKE :search OR user.first_name ILIKE :search OR user.last_name ILIKE :search OR user.username ILIKE :search)',
                { search: `%${filters.search}%` },
            );
        }

        queryBuilder.skip(pagination.skip).take(pagination.take);
        queryBuilder.orderBy('user.created_at', 'DESC');

        const [schemas, total] = await queryBuilder.getManyAndCount();
        const users = schemas.map((schema) => UserMapper.toDomain(schema));

        return { users, total };
    }
}