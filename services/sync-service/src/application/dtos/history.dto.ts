export interface OperationLogResponse {
  id: string;
  eventId: string;
  eventType: string;
  operationType: 'CREATED' | 'UPDATED' | 'DELETED' | 'SYNCED' | 'FAILED' | 'RETRIED';
  sourceService: string;
  targetServices: string[];
  entityType: string;
  entityId: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  duration: number;
  errorMessage?: string;
  retryCount: number;
  timestamp: Date;
  userId?: string;
  metadata?: Record<string, any>;
}

export interface HistoryResponseDto {
  status: string;
  data: OperationLogResponse[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
    totalPages: number;
  };
}

export interface EntityHistoryResponseDto {
  status: string;
  entityId: string;
  operations: OperationLogResponse[];
  count: number;
}

export interface EventHistoryResponseDto {
  status: string;
  eventId: string;
  operations: OperationLogResponse[];
  count: number;
  timeline: string;
}

export interface StatsResponseDto {
  status: string;
  stats: {
    totalOperations: number;
    successCount: number;
    failureCount: number;
    pendingCount: number;
    averageDuration: number;
    operationsByType: Record<string, number>;
    operationsByStatus: Record<string, number>;
    failureRate: number;
    lastOperationAt: Date | null;
    uptime: string;
  };
  health: {
    redisConnected: boolean;
    timestamp: Date;
  };
}

export interface ServiceStatsResponseDto {
  status: string;
  serviceName: string;
  stats: {
    totalOperations: number;
    successCount: number;
    failureCount: number;
    pendingCount: number;
    averageDuration: number;
    operationsByType: Record<string, number>;
    operationsByStatus: Record<string, number>;
    failureRate: number;
    lastOperationAt: Date | null;
  };
}

export interface HealthCheckResponseDto {
  status: 'healthy' | 'unhealthy';
  components: {
    redis: 'connected' | 'disconnected';
  };
  timestamp: Date;
}

export interface PurgeResponseDto {
  status: string;
  message: string;
  purgedCount: number;
}
