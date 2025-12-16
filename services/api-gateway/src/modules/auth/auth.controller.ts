// src/modules/auth/auth.controller.ts

import {
    Controller,
    Post,
    Body,
    Get,
    Delete,
    Req,
    HttpCode,
    HttpStatus,
    UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { Public } from '../../common/decorators';
import { JwtAuthGuard } from '../../common/guards';
import { ProxyService } from '../proxy/proxy.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly proxyService: ProxyService) {}

    @Public()
    @Post('register')
    async register(@Body() body: any) {
        return this.proxyService.forward({
            service: 'auth',
            path: '/auth/register',
            method: 'POST',
            data: body,
        });
    }

    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() body: any) {
        return this.proxyService.forward({
            service: 'auth',
            path: '/auth/login',
            method: 'POST',
            data: body,
        });
    }

    @Public()
    @Post('login/room')
    @HttpCode(HttpStatus.OK)
    async loginByRoom(@Body() body: any) {
        return this.proxyService.forward({
            service: 'auth',
            path: '/auth/login/room',
            method: 'POST',
            data: body,
        });
    }

    @Public()
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(@Body() body: any) {
        return this.proxyService.forward({
            service: 'auth',
            path: '/auth/refresh',
            method: 'POST',
            data: body,
        });
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(@Req() req: Request, @Body() body: any) {
        const token = req.headers.authorization;
        return this.proxyService.forward({
            service: 'auth',
            path: '/auth/logout',
            method: 'POST',
            data: body,
            headers: { Authorization: token || '' },
        });
    }

    @UseGuards(JwtAuthGuard)
    @Delete('logout/all')
    async logoutAll(@Req() req: Request) {
        const token = req.headers.authorization;
        return this.proxyService.forward({
            service: 'auth',
            path: '/auth/logout/all',
            method: 'DELETE',
            headers: { Authorization: token || '' },
        });
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    async me(@Req() req: Request) {
        const token = req.headers.authorization;
        return this.proxyService.forward({
            service: 'auth',
            path: '/auth/me',
            method: 'GET',
            headers: { Authorization: token || '' },
        });
    }

    @UseGuards(JwtAuthGuard)
    @Get('sessions')
    async sessions(@Req() req: Request) {
        const token = req.headers.authorization;
        return this.proxyService.forward({
            service: 'auth',
            path: '/auth/sessions',
            method: 'GET',
            headers: { Authorization: token || '' },
        });
    }

    @UseGuards(JwtAuthGuard)
    @Post('password/change')
    @HttpCode(HttpStatus.OK)
    async changePassword(@Req() req: Request, @Body() body: any) {
        const token = req.headers.authorization;
        return this.proxyService.forward({
            service: 'auth',
            path: '/auth/password/change',
            method: 'POST',
            data: body,
            headers: { Authorization: token || '' },
        });
    }

    @Public()
    @Post('password/reset/request')
    @HttpCode(HttpStatus.OK)
    async requestPasswordReset(@Body() body: any) {
        return this.proxyService.forward({
            service: 'auth',
            path: '/auth/password/reset/request',
            method: 'POST',
            data: body,
        });
    }

    @Public()
    @Post('password/reset/confirm')
    @HttpCode(HttpStatus.OK)
    async confirmPasswordReset(@Body() body: any) {
        return this.proxyService.forward({
            service: 'auth',
            path: '/auth/password/reset/confirm',
            method: 'POST',
            data: body,
        });
    }

    @Public()
    @Post('verify-email')
    @HttpCode(HttpStatus.OK)
    async verifyEmail(@Body() body: any) {
        return this.proxyService.forward({
            service: 'auth',
            path: '/auth/verify-email',
            method: 'POST',
            data: body,
        });
    }
}
