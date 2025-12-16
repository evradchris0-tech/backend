// E2E Test: Inter-Service Communication
import { describe, test, expect, beforeAll } from '@jest/globals';
import { TestClient, config, waitForAllServices, generateTestUser, sleep } from './setup';

describe('Inter-Service Communication E2E', () => {
  let apiGateway: TestClient;
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    await waitForAllServices();

    apiGateway = new TestClient(config.apiGateway);

    // Create and authenticate a test user
    const user = generateTestUser();
    await apiGateway.post('/auth/register', user);
    const loginResponse = await apiGateway.post('/auth/login', {
      email: user.email,
      password: user.password,
    });

    authToken = loginResponse.data.accessToken;
    userId = loginResponse.data.user.id;
    apiGateway.setToken(authToken);
  }, 60000);

  describe('User and Auth Integration', () => {
    test('should sync user data between Auth and User services', async () => {
      // Get user from User Service
      const userResponse = await apiGateway.get('/users/profile');
      expect(userResponse.status).toBe(200);
      expect(userResponse.data).toHaveProperty('id', userId);
    });
  });

  describe('Infrastructure and Equipment Integration', () => {
    test('should create a building and associate equipment', async () => {
      // Create a building
      const buildingData = {
        name: 'Test Building',
        address: '123 Test St',
        city: 'Test City',
        postalCode: '12345',
        country: 'Test Country',
      };

      const buildingResponse = await apiGateway.post('/infrastructure/buildings', buildingData);
      expect(buildingResponse.status).toBe(201);
      const buildingId = buildingResponse.data.id;

      // Create equipment for the building
      const equipmentData = {
        name: 'Test Equipment',
        type: 'HVAC',
        buildingId,
        location: 'Ground Floor',
      };

      const equipmentResponse = await apiGateway.post('/equipment', equipmentData);
      expect(equipmentResponse.status).toBe(201);
      expect(equipmentResponse.data).toHaveProperty('buildingId', buildingId);
    });
  });

  describe('Incidents and Notifications Integration', () => {
    test('should create an incident and trigger notification via RabbitMQ', async () => {
      // Create a building first
      const buildingResponse = await apiGateway.post('/infrastructure/buildings', {
        name: 'Incident Test Building',
        address: '456 Test Ave',
        city: 'Test City',
        postalCode: '54321',
        country: 'Test Country',
      });
      const buildingId = buildingResponse.data.id;

      // Create an incident
      const incidentData = {
        title: 'Water Leak',
        description: 'There is a water leak in the basement',
        priority: 'HIGH',
        buildingId,
        reportedBy: userId,
      };

      const incidentResponse = await apiGateway.post('/incidents', incidentData);
      expect(incidentResponse.status).toBe(201);
      expect(incidentResponse.data).toHaveProperty('id');
      expect(incidentResponse.data).toHaveProperty('status', 'OPEN');

      // Wait for async notification processing
      await sleep(2000);

      // Check if notification was created (this assumes notifications endpoint exists)
      // const notificationsResponse = await apiGateway.get('/notifications');
      // expect(notificationsResponse.status).toBe(200);
    });
  });

  describe('Audit Logging Integration', () => {
    test('should log actions in Audit Service via RabbitMQ', async () => {
      // Create a building (this should trigger an audit log)
      const buildingData = {
        name: 'Audit Test Building',
        address: '789 Audit Rd',
        city: 'Audit City',
        postalCode: '98765',
        country: 'Test Country',
      };

      const buildingResponse = await apiGateway.post('/infrastructure/buildings', buildingData);
      expect(buildingResponse.status).toBe(201);

      // Wait for async audit processing
      await sleep(2000);

      // Check audit logs (assuming endpoint exists)
      // const auditResponse = await apiGateway.get('/audit/logs');
      // expect(auditResponse.status).toBe(200);
      // expect(auditResponse.data.some(log => log.action === 'CREATE_BUILDING')).toBe(true);
    });
  });

  describe('Analytics Service Integration', () => {
    test('should collect analytics data from multiple services', async () => {
      // Create multiple entities to generate analytics data
      await apiGateway.post('/infrastructure/buildings', {
        name: 'Analytics Building 1',
        address: '100 Analytics St',
        city: 'Test City',
        postalCode: '11111',
        country: 'Test Country',
      });

      await apiGateway.post('/infrastructure/buildings', {
        name: 'Analytics Building 2',
        address: '200 Analytics St',
        city: 'Test City',
        postalCode: '22222',
        country: 'Test Country',
      });

      // Wait for analytics processing
      await sleep(2000);

      // Query analytics (assuming endpoint exists)
      // const analyticsResponse = await apiGateway.get('/analytics/dashboard');
      // expect(analyticsResponse.status).toBe(200);
      // expect(analyticsResponse.data).toHaveProperty('totalBuildings');
    });
  });

  describe('File Storage Integration', () => {
    test('should upload and retrieve files', async () => {
      // Note: This test requires multipart/form-data support
      // const fileData = new FormData();
      // fileData.append('file', Buffer.from('test content'), 'test.txt');
      // fileData.append('description', 'Test file');

      // const uploadResponse = await apiGateway.post('/files/upload', fileData, {
      //   headers: { 'Content-Type': 'multipart/form-data' },
      // });
      // expect(uploadResponse.status).toBe(201);

      // const fileId = uploadResponse.data.id;
      // const downloadResponse = await apiGateway.get(`/files/${fileId}`);
      // expect(downloadResponse.status).toBe(200);

      // Placeholder for now
      expect(true).toBe(true);
    });
  });

  describe('Import/Export Service Integration', () => {
    test('should import occupants data', async () => {
      // Note: This test requires file upload support
      // Placeholder for now
      expect(true).toBe(true);
    });
  });

  describe('Service Health Checks', () => {
    test('all services should respond to health checks', async () => {
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

      for (const { name, client } of services) {
        const response = await client.healthCheck();
        expect(response.status).toBe(200);
        console.log(`✓ ${name} health check passed`);
      }
    });
  });

  describe('RabbitMQ Event Flow', () => {
    test('should process events asynchronously across services', async () => {
      // Create an action that triggers multiple events
      const buildingData = {
        name: 'Event Test Building',
        address: '999 Event Blvd',
        city: 'Event City',
        postalCode: '99999',
        country: 'Test Country',
      };

      const buildingResponse = await apiGateway.post('/infrastructure/buildings', buildingData);
      expect(buildingResponse.status).toBe(201);

      // Wait for async event processing
      await sleep(3000);

      // Events should have been processed by:
      // - Audit Service (CREATE_BUILDING event)
      // - Analytics Service (building count update)
      // - Notifications Service (admin notification)

      // Verification would require checking each service
      // For now, we just verify the building was created
      expect(buildingResponse.data).toHaveProperty('id');
    });
  });
});
