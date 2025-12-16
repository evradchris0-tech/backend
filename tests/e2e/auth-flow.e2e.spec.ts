// E2E Test: Authentication Flow
import { describe, test, expect, beforeAll } from '@jest/globals';
import { TestClient, config, waitForAllServices, generateTestUser } from './setup';

describe('Authentication Flow E2E', () => {
  let apiGateway: TestClient;
  let authService: TestClient;
  let userService: TestClient;

  beforeAll(async () => {
    await waitForAllServices();

    apiGateway = new TestClient(config.apiGateway);
    authService = new TestClient(config.authService);
    userService = new TestClient(config.userService);
  }, 60000);

  test('should register a new user via API Gateway', async () => {
    const user = generateTestUser();

    const response = await apiGateway.post('/auth/register', user);

    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty('id');
    expect(response.data).toHaveProperty('email', user.email);
    expect(response.data).not.toHaveProperty('password');
  });

  test('should login with valid credentials', async () => {
    const user = generateTestUser();

    // Register
    await apiGateway.post('/auth/register', user);

    // Login
    const loginResponse = await apiGateway.post('/auth/login', {
      email: user.email,
      password: user.password,
    });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.data).toHaveProperty('accessToken');
    expect(loginResponse.data).toHaveProperty('refreshToken');
    expect(loginResponse.data.user).toHaveProperty('email', user.email);
  });

  test('should fail login with invalid credentials', async () => {
    const response = await apiGateway.post('/auth/login', {
      email: 'nonexistent@example.com',
      password: 'WrongPassword123!',
    });

    expect(response.status).toBe(401);
  });

  test('should access protected route with valid token', async () => {
    const user = generateTestUser();

    // Register
    await apiGateway.post('/auth/register', user);

    // Login
    const loginResponse = await apiGateway.post('/auth/login', {
      email: user.email,
      password: user.password,
    });

    const { accessToken } = loginResponse.data;

    // Access protected route
    apiGateway.setToken(accessToken);
    const profileResponse = await apiGateway.get('/users/profile');

    expect(profileResponse.status).toBe(200);
    expect(profileResponse.data).toHaveProperty('email', user.email);
  });

  test('should fail to access protected route without token', async () => {
    apiGateway.clearToken();
    const response = await apiGateway.get('/users/profile');

    expect(response.status).toBe(401);
  });

  test('should refresh token successfully', async () => {
    const user = generateTestUser();

    // Register
    await apiGateway.post('/auth/register', user);

    // Login
    const loginResponse = await apiGateway.post('/auth/login', {
      email: user.email,
      password: user.password,
    });

    const { refreshToken } = loginResponse.data;

    // Refresh token
    const refreshResponse = await apiGateway.post('/auth/refresh', {
      refreshToken,
    });

    expect(refreshResponse.status).toBe(200);
    expect(refreshResponse.data).toHaveProperty('accessToken');
    expect(refreshResponse.data).toHaveProperty('refreshToken');
  });

  test('should logout successfully', async () => {
    const user = generateTestUser();

    // Register
    await apiGateway.post('/auth/register', user);

    // Login
    const loginResponse = await apiGateway.post('/auth/login', {
      email: user.email,
      password: user.password,
    });

    const { accessToken } = loginResponse.data;

    // Logout
    apiGateway.setToken(accessToken);
    const logoutResponse = await apiGateway.post('/auth/logout');

    expect(logoutResponse.status).toBe(200);

    // Try to access protected route after logout
    const profileResponse = await apiGateway.get('/users/profile');
    expect(profileResponse.status).toBe(401);
  });
});
