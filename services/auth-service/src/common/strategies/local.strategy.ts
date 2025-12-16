// src/common/strategies/local.strategy.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { LoginUseCase } from '../../application/use-cases/login.use-case';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
    constructor(private readonly loginUseCase: LoginUseCase) {
        super({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true,
        });
    }

    async validate(
        req: any,
        email: string,
        password: string,
    ): Promise<any> {
        const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
        const userAgent = req.headers['user-agent'] || 'unknown';

        try {
            const result = await this.loginUseCase.execute(
                { email, password },
                ipAddress,
                userAgent,
            );
            return result;
        } catch (error) {
            throw new UnauthorizedException(error.message);
        }
    }
}