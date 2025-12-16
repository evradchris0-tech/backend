// src/infrastructure/http/controllers/internal.controller.ts

import {
    Controller,
    Post,
    Patch,
    Body,
    Headers,
    UnauthorizedException,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { SyncUserUseCase } from '../../../application/use-cases/sync-user.use-case';

@Controller('internal')
export class InternalController {
    constructor(private readonly syncUserUseCase: SyncUserUseCase) { }

    private validateInternalRequest(headers: any): void {
        const internalService = headers['x-internal-service'];
        if (internalService !== 'user-service') {
            throw new UnauthorizedException('Invalid internal service token');
        }
    }

    @Post('users/sync')
    @HttpCode(HttpStatus.OK)
    async syncUserCreated(
        @Body() body: any,
        @Headers() headers: any,
    ) {
        this.validateInternalRequest(headers);
        await this.syncUserUseCase.execute(body);
        return { message: 'User synced successfully' };
    }

    @Patch('users/sync')
    @HttpCode(HttpStatus.OK)
    async syncUserUpdated(
        @Body() body: any,
        @Headers() headers: any,
    ) {
        this.validateInternalRequest(headers);
        await this.syncUserUseCase.execute(body);
        return { message: 'User updated successfully' };
    }
}