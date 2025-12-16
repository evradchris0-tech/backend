// src/common/decorators/ip.decorator.ts

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Ip = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): string => {
        const request = ctx.switchToHttp().getRequest();
        return request.ip || request.connection.remoteAddress || 'unknown';
    },
);  