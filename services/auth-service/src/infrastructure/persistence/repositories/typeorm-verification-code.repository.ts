// src/infrastructure/persistence/repositories/typeorm-verification-code.repository.ts

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import {
    IVerificationCodeRepository,
    VerificationCodeData,
} from '../../../domain/repositories/verification-code.repository.interface'
import { VerificationCodeSchema } from '../schemas/verification-code.schema';

@Injectable()
export class TypeOrmVerificationCodeRepository implements IVerificationCodeRepository {
    private readonly logger = new Logger(TypeOrmVerificationCodeRepository.name);

    constructor(
        @InjectRepository(VerificationCodeSchema)
        private readonly repository: Repository<VerificationCodeSchema>,
    ) {}

    async save(data: VerificationCodeData): Promise<VerificationCodeData> {
        // Supprimer les anciens codes pour cet email (évite les doublons)
        await this.deleteByEmail(data.email);

        const entity = this.repository.create({
            code: data.code,
            email: data.email,
            expiresAt: data.expiresAt,
            type: data.type,
        });

        const saved = await this.repository.save(entity);
        this.logger.debug(`Verification code saved for ${data.email}`);

        return {
            code: saved.code,
            email: saved.email,
            expiresAt: saved.expiresAt,
            type: saved.type,
            createdAt: saved.createdAt,
        };
    }

    async findByCode(code: string): Promise<VerificationCodeData | undefined> {
        const entity = await this.repository.findOne({
            where: { code },
        });

        if (!entity) {
            return undefined;
        }

        return {
            code: entity.code,
            email: entity.email,
            expiresAt: entity.expiresAt,
            type: entity.type,
            createdAt: entity.createdAt,
        };
    }

    async delete(code: string): Promise<void> {
        await this.repository.delete({ code });
        this.logger.debug(`Verification code deleted: ${code}`);
    }

    async deleteExpired(now?: Date): Promise<number> {
        const deleteTime = now || new Date();
        const result = await this.repository.delete({
            expiresAt: LessThan(deleteTime),
        });
        const count = result.affected || 0;
        if (count > 0) {
            this.logger.log(`Cleaned up ${count} expired verification codes`);
        }
        return count;
    }

    async deleteByEmail(email: string): Promise<void> {
        await this.repository.delete({ email });
    }
}