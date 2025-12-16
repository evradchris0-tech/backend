// src/common/guards/throttle.guard.ts

import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerException } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
    protected async getTracker(req: Record<string, any>): Promise<string> {
        const userId = req.user?.userId;
        return userId ? `user:${userId}` : `ip:${req.ip}`;
    }

    protected async throwThrottlingException(): Promise<void> {
        throw new ThrottlerException('Trop de requetes. Veuillez reessayer dans quelques instants.');
    }
}
