// src/modules/users/users.controller.ts

import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Patch,
    Body,
    Param,
    Query,
    Req,
    Res,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    ParseUUIDPipe,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { Roles } from '../../common/decorators';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { ProxyService } from '../proxy/proxy.service';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
    constructor(private readonly proxyService: ProxyService) {}

    @Roles('ADMINISTRATEUR', 'SUPERVISEUR')
    @Get()
    async findAll(@Req() req: Request, @Query() query: any) {
        const token = req.headers.authorization;
        return this.proxyService.forward({
            service: 'user',
            path: '/users',
            method: 'GET',
            headers: { Authorization: token || '' },
            params: query,
        });
    }

    @Roles('ADMINISTRATEUR')
    @Get('statistics')
    async getStatistics(@Req() req: Request) {
        const token = req.headers.authorization;
        return this.proxyService.forward({
            service: 'user',
            path: '/users/statistics',
            method: 'GET',
            headers: { Authorization: token || '' },
        });
    }

    @Roles('ADMINISTRATEUR')
    @Get('export')
    async exportUsers(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
        @Query() query: any,
    ) {
        const token = req.headers.authorization;
        const result = await this.proxyService.forward({
            service: 'user',
            path: '/users/export',
            method: 'GET',
            headers: { Authorization: token || '' },
            params: query,
        });

        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename="utilisateurs.xlsx"',
        });

        return result;
    }

    @Roles('ADMINISTRATEUR')
    @Get('import/template')
    async getImportTemplate(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const token = req.headers.authorization;
        const result = await this.proxyService.forward({
            service: 'user',
            path: '/users/import/template',
            method: 'GET',
            headers: { Authorization: token || '' },
        });

        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename="template_occupants.xlsx"',
        });

        return result;
    }

    @Roles('ADMINISTRATEUR')
    @Post('import/validate')
    @UseInterceptors(FileInterceptor('file'))
    async validateImport(@Req() req: Request, @UploadedFile() file: Express.Multer.File) {
        const token = req.headers.authorization;
        return this.proxyService.forward({
            service: 'user',
            path: '/users/import/validate',
            method: 'POST',
            headers: { Authorization: token || '' },
            data: {
                file: file.buffer.toString('base64'),
                filename: file.originalname,
                mimetype: file.mimetype,
            },
        });
    }

    @Roles('ADMINISTRATEUR')
    @Post('import')
    @UseInterceptors(FileInterceptor('file'))
    async importUsers(@Req() req: Request, @UploadedFile() file: Express.Multer.File) {
        const token = req.headers.authorization;
        return this.proxyService.forward({
            service: 'user',
            path: '/users/import',
            method: 'POST',
            headers: { Authorization: token || '' },
            data: {
                file: file.buffer.toString('base64'),
                filename: file.originalname,
                mimetype: file.mimetype,
            },
        });
    }

    @Roles('ADMINISTRATEUR', 'SUPERVISEUR')
    @Get(':id')
    async findOne(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
        const token = req.headers.authorization;
        return this.proxyService.forward({
            service: 'user',
            path: `/users/${id}`,
            method: 'GET',
            headers: { Authorization: token || '' },
        });
    }

    @Roles('ADMINISTRATEUR')
    @Post()
    async create(@Req() req: Request, @Body() body: any) {
        const token = req.headers.authorization;
        return this.proxyService.forward({
            service: 'user',
            path: '/users',
            method: 'POST',
            headers: { Authorization: token || '' },
            data: body,
        });
    }

    @Roles('ADMINISTRATEUR')
    @Put(':id')
    async update(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string, @Body() body: any) {
        const token = req.headers.authorization;
        return this.proxyService.forward({
            service: 'user',
            path: `/users/${id}`,
            method: 'PUT',
            headers: { Authorization: token || '' },
            data: body,
        });
    }

    @Roles('ADMINISTRATEUR')
    @Patch(':id')
    async partialUpdate(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string, @Body() body: any) {
        const token = req.headers.authorization;
        return this.proxyService.forward({
            service: 'user',
            path: `/users/${id}`,
            method: 'PATCH',
            headers: { Authorization: token || '' },
            data: body,
        });
    }

    @Roles('ADMINISTRATEUR')
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
        const token = req.headers.authorization;
        return this.proxyService.forward({
            service: 'user',
            path: `/users/${id}`,
            method: 'DELETE',
            headers: { Authorization: token || '' },
        });
    }

    @Roles('ADMINISTRATEUR')
    @Patch(':id/status')
    async updateStatus(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string, @Body() body: { status: string }) {
        const token = req.headers.authorization;
        return this.proxyService.forward({
            service: 'user',
            path: `/users/${id}/status`,
            method: 'PATCH',
            headers: { Authorization: token || '' },
            data: body,
        });
    }

    @Roles('ADMINISTRATEUR')
    @Patch(':id/role')
    async updateRole(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string, @Body() body: { role: string }) {
        const token = req.headers.authorization;
        return this.proxyService.forward({
            service: 'user',
            path: `/users/${id}/role`,
            method: 'PATCH',
            headers: { Authorization: token || '' },
            data: body,
        });
    }

    @Roles('ADMINISTRATEUR')
    @Post(':id/assign-room')
    async assignRoom(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string, @Body() body: any) {
        const token = req.headers.authorization;
        return this.proxyService.forward({
            service: 'user',
            path: `/users/${id}/assign-room`,
            method: 'POST',
            headers: { Authorization: token || '' },
            data: body,
        });
    }

    @Roles('ADMINISTRATEUR')
    @Delete(':id/unassign-room')
    async unassignRoom(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
        const token = req.headers.authorization;
        return this.proxyService.forward({
            service: 'user',
            path: `/users/${id}/unassign-room`,
            method: 'DELETE',
            headers: { Authorization: token || '' },
        });
    }
}
