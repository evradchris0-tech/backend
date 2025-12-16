import {
  Controller,
  Get,
  Query,
  Param,
  Post,
  Res,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { OperationHistoryService } from '../../../application/services/operation-history.service';

@Controller('history')
export class HistoryController {
  private readonly logger = new Logger(HistoryController.name);

  constructor(private readonly historyService: OperationHistoryService) {}

  /**
   * GET /history
   * Récupérer l'historique des opérations avec filtres et pagination
   */
  @Get()
  async getHistory(
    @Query('eventType') eventType?: string,
    @Query('operationType')
    operationType?: 'CREATED' | 'UPDATED' | 'DELETED' | 'SYNCED' | 'FAILED' | 'RETRIED',
    @Query('status') status?: 'SUCCESS' | 'FAILED' | 'PENDING',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('entityId') entityId?: string,
    @Query('sourceService') sourceService?: string,
    @Query('targetService') targetService?: string,
    @Query('limit') limit: number = 50,
    @Query('offset') offset: number = 0,
  ) {
    try {
      const filters = {
        eventType,
        operationType,
        status,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        entityId,
        sourceService,
        targetService,
        limit: Math.min(Math.max(1, limit), 500),
        offset: Math.max(0, offset),
      };

      const history = await this.historyService.getHistory(filters);

      return {
        status: 'success',
        data: history.data,
        pagination: {
          total: history.total,
          limit: history.limit,
          offset: history.offset,
          hasMore: history.hasMore,
          totalPages: Math.ceil(history.total / history.limit),
        },
      };
    } catch (error) {
      this.logger.error('Failed to get history', error);
      throw new BadRequestException('Failed to retrieve history');
    }
  }

  /**
   * GET /history/entity/:entityId
   * Récupérer l'historique complet d'une entité
   */
  @Get('entity/:entityId')
  async getEntityHistory(
    @Param('entityId') entityId: string,
    @Query('limit') limit: number = 100,
  ) {
    try {
      const history = await this.historyService.getEntityHistory(
        entityId,
        Math.min(limit, 500),
      );

      return {
        status: 'success',
        entityId,
        operations: history,
        count: history.length,
      };
    } catch (error) {
      this.logger.error(`Failed to get entity history for ${entityId}`, error);
      throw new BadRequestException('Failed to retrieve entity history');
    }
  }

  /**
   * GET /history/event/:eventId
   * Récupérer l'historique complet d'un événement
   */
  @Get('event/:eventId')
  async getEventHistory(@Param('eventId') eventId: string) {
    try {
      const history = await this.historyService.getEventHistory(eventId);

      return {
        status: 'success',
        eventId,
        operations: history,
        count: history.length,
        timeline: this.buildTimeline(history),
      };
    } catch (error) {
      this.logger.error(`Failed to get event history for ${eventId}`, error);
      throw new BadRequestException('Failed to retrieve event history');
    }
  }

  /**
   * GET /history/stats
   * Récupérer les statistiques globales
   */
  @Get('stats')
  async getStats() {
    try {
      const stats = await this.historyService.getStats();

      return {
        status: 'success',
        stats,
        health: {
          redisConnected: await this.historyService.healthCheck(),
          timestamp: new Date(),
        },
      };
    } catch (error) {
      this.logger.error('Failed to get stats', error);
      throw new BadRequestException('Failed to retrieve statistics');
    }
  }

  /**
   * GET /history/stats/service/:serviceName
   * Récupérer les statistiques d'un service
   */
  @Get('stats/service/:serviceName')
  async getServiceStats(@Param('serviceName') serviceName: string) {
    try {
      const stats = await this.historyService.getStatsByService(serviceName);

      return {
        status: 'success',
        serviceName,
        stats,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get stats for service ${serviceName}`,
        error,
      );
      throw new BadRequestException('Failed to retrieve service statistics');
    }
  }

  /**
   * GET /history/stats/type/:eventType
   * Récupérer les statistiques d'un type d'événement
   */
  @Get('stats/type/:eventType')
  async getTypeStats(@Param('eventType') eventType: string) {
    try {
      const stats = await this.historyService.getStatsByType(eventType);

      return {
        status: 'success',
        eventType,
        stats,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get stats for type ${eventType}`,
        error,
      );
      throw new BadRequestException('Failed to retrieve type statistics');
    }
  }

  /**
   * GET /history/export/csv
   * Exporter l'historique en CSV
   */
  @Get('export/csv')
  async exportCSV(
    @Query('eventType') eventType?: string,
    @Query('status') status?: 'SUCCESS' | 'FAILED' | 'PENDING',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Res() res?: Response,
  ) {
    try {
      const filters = {
        eventType,
        status,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      };

      const csv = await this.historyService.exportToCSV(filters);

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=sync-history.csv',
      );
      res.send(csv);
    } catch (error) {
      this.logger.error('Failed to export CSV', error);
      throw new BadRequestException('Failed to export history');
    }
  }

  /**
   * POST /history/purge
   * Purger les opérations anciennes
   */
  @Post('purge')
  @HttpCode(HttpStatus.OK)
  async purgeOldOperations(@Query('daysOld') daysOld: number = 90) {
    try {
      if (daysOld < 7) {
        throw new BadRequestException(
          'Cannot purge operations less than 7 days old',
        );
      }

      const count = await this.historyService.purgeOldOperations(daysOld);

      return {
        status: 'success',
        message: `Purged ${count} operations older than ${daysOld} days`,
        purgedCount: count,
      };
    } catch (error) {
      this.logger.error('Failed to purge operations', error);
      throw new BadRequestException('Failed to purge operations');
    }
  }

  /**
   * GET /history/health
   * Vérifier la santé du service d'historique
   */
  @Get('health')
  async healthCheck() {
    const redisConnected = await this.historyService.healthCheck();

    return {
      status: redisConnected ? 'healthy' : 'unhealthy',
      components: {
        redis: redisConnected ? 'connected' : 'disconnected',
      },
      timestamp: new Date(),
    };
  }

  /**
   * Helper: Construire une timeline d'un événement
   */
  private buildTimeline(operations: any[]): string {
    const sorted = operations.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );

    return sorted
      .map(
        (op) =>
          `[${op.timestamp}] ${op.operationType} on ${op.targetServices.join(', ')} - ${op.status}${
            op.errorMessage ? ` (${op.errorMessage})` : ''
          }`,
      )
      .join('\n');
  }
}
