// src/application/services/__tests__/verification-code.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { VerificationCodeService } from '../verification-code.service';
import { IVerificationCodeRepository, VerificationCodeData } from '../../../domain/repositories/verification-code.repository.interface';

describe('VerificationCodeService', () => {
    let service: VerificationCodeService;
    let mockRepository: jest.Mocked<IVerificationCodeRepository>;

    beforeEach(async () => {
        mockRepository = {
            save: jest.fn(),
            findByCode: jest.fn(),
            delete: jest.fn(),
            deleteExpired: jest.fn(),
            deleteByEmail: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                VerificationCodeService,
                {
                    provide: 'IVerificationCodeRepository',
                    useValue: mockRepository,
                },
            ],
        }).compile();

        service = module.get<VerificationCodeService>(VerificationCodeService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('generateCode', () => {
        it('should generate a 6-character uppercase alphanumeric code', () => {
            const code = service.generateCode();
            
            expect(code).toHaveLength(6);
            expect(code).toMatch(/^[A-F0-9]{6}$/);
        });

        it('should generate different codes on subsequent calls', () => {
            const codes = new Set<string>();
            for (let i = 0; i < 100; i++) {
                codes.add(service.generateCode());
            }
            // Au moins 90% de codes uniques (probabilité très élevée)
            expect(codes.size).toBeGreaterThan(90);
        });
    });

    describe('storeVerificationCode', () => {
        it('should store code with correct expiration (24h)', async () => {
            const email = 'test@example.com';
            const code = 'ABC123';

            await service.storeVerificationCode(email, code);

            expect(mockRepository.save).toHaveBeenCalledTimes(1);
            const savedData = mockRepository.save.mock.calls[0][0];
            
            expect(savedData.code).toBe(code);
            expect(savedData.email).toBe(email);
            expect(savedData.type).toBe('EMAIL_VERIFICATION');
            
            // Vérifier que l'expiration est dans ~24h
            const expectedExpiry = Date.now() + 24 * 60 * 60 * 1000;
            const actualExpiry = savedData.expiresAt.getTime();
            expect(actualExpiry).toBeGreaterThan(expectedExpiry - 1000);
            expect(actualExpiry).toBeLessThan(expectedExpiry + 1000);
        });

        it('should store code with PASSWORD_RESET type when specified', async () => {
            await service.storeVerificationCode('test@example.com', 'ABC123', 'PASSWORD_RESET');

            const savedData = mockRepository.save.mock.calls[0][0];
            expect(savedData.type).toBe('PASSWORD_RESET');
        });
    });

    describe('getEmailByCode', () => {
        it('should return email for valid non-expired code', async () => {
            const mockData: VerificationCodeData = {
                code: 'ABC123',
                email: 'test@example.com',
                expiresAt: new Date(Date.now() + 60000), // Expire dans 1 minute
                type: 'EMAIL_VERIFICATION',
                createdAt: new Date(),
            };
            mockRepository.findByCode.mockResolvedValue(mockData);

            const result = await service.getEmailByCode('ABC123');

            expect(result).toBe('test@example.com');
            expect(mockRepository.findByCode).toHaveBeenCalledWith('ABC123');
        });

        it('should return null for non-existent code', async () => {
            mockRepository.findByCode.mockResolvedValue(null);

            const result = await service.getEmailByCode('NOTFOUND');

            expect(result).toBeNull();
        });

        it('should return null and delete expired code', async () => {
            const mockData: VerificationCodeData = {
                code: 'EXPIRED',
                email: 'test@example.com',
                expiresAt: new Date(Date.now() - 60000), // Expiré il y a 1 minute
                type: 'EMAIL_VERIFICATION',
                createdAt: new Date(),
            };
            mockRepository.findByCode.mockResolvedValue(mockData);

            const result = await service.getEmailByCode('EXPIRED');

            expect(result).toBeNull();
            expect(mockRepository.delete).toHaveBeenCalledWith('EXPIRED');
        });
    });

    describe('validateAndConsumeCode', () => {
        it('should return true and delete code for valid code and matching email', async () => {
            const mockData: VerificationCodeData = {
                code: 'ABC123',
                email: 'test@example.com',
                expiresAt: new Date(Date.now() + 60000),
                type: 'EMAIL_VERIFICATION',
                createdAt: new Date(),
            };
            mockRepository.findByCode.mockResolvedValue(mockData);

            const result = await service.validateAndConsumeCode('ABC123', 'test@example.com');

            expect(result).toBe(true);
            expect(mockRepository.delete).toHaveBeenCalledWith('ABC123');
        });

        it('should return false for non-existent code', async () => {
            mockRepository.findByCode.mockResolvedValue(null);

            const result = await service.validateAndConsumeCode('NOTFOUND', 'test@example.com');

            expect(result).toBe(false);
            expect(mockRepository.delete).not.toHaveBeenCalled();
        });

        it('should return false for expired code', async () => {
            const mockData: VerificationCodeData = {
                code: 'EXPIRED',
                email: 'test@example.com',
                expiresAt: new Date(Date.now() - 60000),
                type: 'EMAIL_VERIFICATION',
                createdAt: new Date(),
            };
            mockRepository.findByCode.mockResolvedValue(mockData);

            const result = await service.validateAndConsumeCode('EXPIRED', 'test@example.com');

            expect(result).toBe(false);
            expect(mockRepository.delete).toHaveBeenCalledWith('EXPIRED');
        });

        it('should return false for email mismatch', async () => {
            const mockData: VerificationCodeData = {
                code: 'ABC123',
                email: 'correct@example.com',
                expiresAt: new Date(Date.now() + 60000),
                type: 'EMAIL_VERIFICATION',
                createdAt: new Date(),
            };
            mockRepository.findByCode.mockResolvedValue(mockData);

            const result = await service.validateAndConsumeCode('ABC123', 'wrong@example.com');

            expect(result).toBe(false);
            expect(mockRepository.delete).not.toHaveBeenCalled();
        });
    });

    describe('cleanupExpiredCodes', () => {
        it('should call repository deleteExpired', async () => {
            mockRepository.deleteExpired.mockResolvedValue(5);

            const result = await service.cleanupExpiredCodes();

            expect(result).toBe(5);
            expect(mockRepository.deleteExpired).toHaveBeenCalledTimes(1);
        });
    });
});