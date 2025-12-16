// E2E Test Setup for IMMO360 Microservices
import axios, { AxiosInstance } from 'axios';

export interface TestConfig {
  apiGateway: string;
  authService: string;
  userService: string;
  infrastructureService: string;
  equipmentService: string;
  incidentsService: string;
  auditService: string;
  analyticsService: string;
  notificationsService: string;
  fileStorageService: string;
  importExportService: string;
  syncService: string;
  predictionsService: string;
}

export const config: TestConfig = {
  apiGateway: process.env.API_GATEWAY_URL || 'http://localhost:4000',
  authService: process.env.AUTH_SERVICE_URL || 'http://localhost:4001',
  userService: process.env.USER_SERVICE_URL || 'http://localhost:4002',
  infrastructureService: process.env.INFRASTRUCTURE_SERVICE_URL || 'http://localhost:4003',
  equipmentService: process.env.EQUIPMENT_SERVICE_URL || 'http://localhost:4004',
  incidentsService: process.env.INCIDENTS_SERVICE_URL || 'http://localhost:4005',
  auditService: process.env.AUDIT_SERVICE_URL || 'http://localhost:4006',
  analyticsService: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:4007',
  notificationsService: process.env.NOTIFICATIONS_SERVICE_URL || 'http://localhost:4008',
  fileStorageService: process.env.FILE_STORAGE_SERVICE_URL || 'http://localhost:4009',
  importExportService: process.env.IMPORT_EXPORT_SERVICE_URL || 'http://localhost:4010',
  syncService: process.env.SYNC_SERVICE_URL || 'http://localhost:4011',
  predictionsService: process.env.PREDICTIONS_SERVICE_URL || 'http://localhost:4012',
};

export class TestClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      validateStatus: () => true, // Don't throw on any status code
    });
  }

  setToken(token: string) {
    this.token = token;
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  clearToken() {
    this.token = null;
    delete this.client.defaults.headers.common['Authorization'];
  }

  async get(url: string, params?: any) {
    return this.client.get(url, { params });
  }

  async post(url: string, data?: any) {
    return this.client.post(url, data);
  }

  async put(url: string, data?: any) {
    return this.client.put(url, data);
  }

  async patch(url: string, data?: any) {
    return this.client.patch(url, data);
  }

  async delete(url: string) {
    return this.client.delete(url);
  }

  async healthCheck() {
    return this.get('/health');
  }
}

export const waitForService = async (
  client: TestClient,
  maxAttempts = 30,
  delayMs = 1000,
): Promise<boolean> => {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await client.healthCheck();
      if (response.status === 200) {
        return true;
      }
    } catch (error) {
      // Service not ready yet
    }
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  return false;
};

export const waitForAllServices = async (): Promise<void> => {
  console.log('Waiting for all services to be ready...');

  const services = [
    { name: 'API Gateway', client: new TestClient(config.apiGateway) },
    { name: 'Auth Service', client: new TestClient(config.authService) },
    { name: 'User Service', client: new TestClient(config.userService) },
    { name: 'Infrastructure Service', client: new TestClient(config.infrastructureService) },
    { name: 'Equipment Service', client: new TestClient(config.equipmentService) },
    { name: 'Incidents Service', client: new TestClient(config.incidentsService) },
    { name: 'Audit Service', client: new TestClient(config.auditService) },
    { name: 'Analytics Service', client: new TestClient(config.analyticsService) },
    { name: 'Notifications Service', client: new TestClient(config.notificationsService) },
    { name: 'File Storage Service', client: new TestClient(config.fileStorageService) },
    { name: 'Import/Export Service', client: new TestClient(config.importExportService) },
    { name: 'Sync Service', client: new TestClient(config.syncService) },
    { name: 'Predictions Service', client: new TestClient(config.predictionsService) },
  ];

  const results = await Promise.all(
    services.map(async ({ name, client }) => {
      const ready = await waitForService(client);
      if (ready) {
        console.log(`✓ ${name} is ready`);
      } else {
        console.log(`✗ ${name} failed to start`);
      }
      return { name, ready };
    }),
  );

  const failedServices = results.filter((r) => !r.ready);
  if (failedServices.length > 0) {
    throw new Error(
      `The following services failed to start: ${failedServices.map((s) => s.name).join(', ')}`,
    );
  }

  console.log('All services are ready!');
};

export const generateTestUser = () => ({
  email: `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`,
  password: 'Test123!@#',
  firstName: 'Test',
  lastName: 'User',
});

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
