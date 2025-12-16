// src/infrastructure/http/controllers/users.controller.ts

import {
    Controller,
    Post,
    Get,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    HttpCode,
    HttpStatus,
    UseInterceptors,
    UploadedFile,
    BadRequestException,
    Res,
    UseGuards,
    Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CreateUserUseCase } from '../../../application/use-cases/users/create-user.use-case';
import { UpdateUserUseCase } from '../../../application/use-cases/users/update-user.use-case';
import { DeleteUserUseCase } from '../../../application/use-cases/users/delete-user.use-case';
import { GetUsersUseCase } from '../../../application/use-cases/users/get-users.use-case';
import { GetUserByIdUseCase } from '../../../application/use-cases/users/get-user-by-id.use-case';
import { AssignRoomUseCase } from '../../../application/use-cases/users/assign-room.use-case';
import { ImportOccupantsUseCase } from '../../../application/use-cases/users/import-occupants.use-case';
import { ExcelService } from '../../../application/services/excel.service';
import { CreateUserDto } from '../../../application/dtos/users/create-user.dto';
import { UpdateUserDto } from '../../../application/dtos/users/update-user.dto';
import { AssignRoomDto } from '../../../application/dtos/users/assign-room.dto';
import { PaginatedUsersQueryDto } from '../../../application/dtos/users/paginated-users.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(
        private readonly createUserUseCase: CreateUserUseCase,
        private readonly updateUserUseCase: UpdateUserUseCase,
        private readonly deleteUserUseCase: DeleteUserUseCase,
        private readonly getUsersUseCase: GetUsersUseCase,
        private readonly getUserByIdUseCase: GetUserByIdUseCase,
        private readonly assignRoomUseCase: AssignRoomUseCase,
        private readonly importOccupantsUseCase: ImportOccupantsUseCase,
        private readonly excelService: ExcelService,
    ) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createUser(
        @Body() createUserDto: CreateUserDto,
        @Request() req,
    ) {
        const creatorUserId = req.user.userId; // ✅ Extrait du JWT
        const result = await this.createUserUseCase.execute(createUserDto, creatorUserId);

        return {
            message: 'User created successfully',
            user: result.user,
            temporaryPassword: result.plainPassword,
        };
    }
    
    @Get()
    async getUsers(@Query() queryDto: PaginatedUsersQueryDto) {
        return this.getUsersUseCase.execute(queryDto);
    }

    @Get(':id')
    async getUserById(@Param('id') userId: string) {
        return this.getUserByIdUseCase.execute(userId);
    }

    @Patch(':id')
    async updateUser(
        @Param('id') userId: string,
        @Body() updateUserDto: UpdateUserDto,
        @Request() req,
    ) {
        const updaterUserId = req.user.userId;
        const updatedUser = await this.updateUserUseCase.execute(
            userId,
            updateUserDto,
            updaterUserId,
        );

        return {
            message: 'User updated successfully',
            user: updatedUser,
        };
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async deleteUser(
        @Param('id') userId: string,
        @Request() req,
    ) {
        const deleterUserId = req.user.userId;
        await this.deleteUserUseCase.execute(userId, deleterUserId);

        return {
            message: 'User deleted successfully',
        };
    }

    @Patch(':id/assign-room')
    async assignRoom(
        @Param('id') userId: string,
        @Body() assignRoomDto: AssignRoomDto,
    ) {
        const updatedUser = await this.assignRoomUseCase.execute(userId, assignRoomDto);

        return {
            message: 'Room assigned successfully',
            user: updatedUser,
        };
    }

    @Post('import/occupants')
    @UseInterceptors(FileInterceptor('file'))
    @HttpCode(HttpStatus.OK)
    async importOccupants(
        @UploadedFile() file: Express.Multer.File,
        @Body('academicSessionId') academicSessionId: string,
    ) {
        if (!file) {
            throw new BadRequestException('File is required');
        }

        if (!academicSessionId) {
            throw new BadRequestException('Academic session ID is required');
        }

        const allowedMimeTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
        ];

        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new BadRequestException('Only Excel files (.xlsx, .xls) are allowed');
        }

        const result = await this.importOccupantsUseCase.execute(
            file.buffer,
            academicSessionId,
        );

        return {
            message: 'Import completed',
            summary: {
                totalProcessed: result.totalProcessed,
                successCount: result.successCount,
                failedCount: result.failedCount,
            },
            errors: result.errors,
            createdUsers: result.createdUsers,
        };
    }

    @Get('import/template')
    async downloadImportTemplate(@Res() res: Response) {
        const buffer = this.excelService.generateOccupantsTemplate();

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=occupants_import_template.xlsx');
        res.send(buffer);
    }
}