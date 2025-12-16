// src/infrastructure/persistence/repositories/typeorm-auth-user.repository.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IAuthUserRepository } from '../../../domain/repositories/auth-user.repository.interface';
import { AuthUserEntity } from '../../../domain/entities/auth-user.entity';
import { AuthUserSchema } from '../schemas/auth-user.schema';
import { AuthUserMapper } from '../../../application/mappers/auth-user.mapper';

@Injectable()
export class TypeOrmAuthUserRepository implements IAuthUserRepository {
    constructor(
        @InjectRepository(AuthUserSchema)
        private readonly authUserRepository: Repository<AuthUserSchema>,
    ) { }

    async findById(id: string): Promise<AuthUserEntity | null> {
        const schema = await this.authUserRepository.findOne({ where: { id } });
        return schema ? AuthUserMapper.toDomain(schema) : null;
    }

    async findByEmail(email: string): Promise<AuthUserEntity | null> {
        const schema = await this.authUserRepository.findOne({ where: { email } });
        return schema ? AuthUserMapper.toDomain(schema) : null;
    }

    async save(user: AuthUserEntity): Promise<void> {
        const schema = AuthUserMapper.toSchema(user);
        await this.authUserRepository.save(schema);
    }

    async update(user: AuthUserEntity): Promise<void> {
        const schema = AuthUserMapper.toSchema(user);
        await this.authUserRepository.save(schema);
    }

    async findByGoogleId(googleId: string): Promise<AuthUserEntity | null> {
        const schema = await this.authUserRepository.findOne({
            where: { googleId },
        });

        // fallback QueryBuilder si jamais findOne plante
        if (!schema) {
            const qbSchema = await this.authUserRepository
                .createQueryBuilder('u')
                .where('u.google_id = :googleId', { googleId })
                .getOne();

            return qbSchema ? AuthUserMapper.toDomain(qbSchema) : null;
        }

        return AuthUserMapper.toDomain(schema);
    }



}