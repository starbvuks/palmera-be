const { handler } = require('../../src/handlers/logoutHandler');
const { mockDb, generateTestToken, clearMocks } = require('../testHelper');

describe('logoutHandler', () => {
  beforeEach(() => {
    clearMocks();
  });

  it('should logout successfully', async () => {
    const token = generateTestToken('user-id');
    const event = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    mockDb.deleteMany.mockResolvedValueOnce({ deletedCount: 1 });

    const response = await handler(event);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.message).toBe('Logged out successfully');
  });

  it('should handle missing authorization header', async () => {
    const event = {
      headers: {},
    };

    const response = await handler(event);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(500);
    expect(body.success).toBe(false);
  });

  it('should handle invalid token format', async () => {
    const event = {
      headers: {
        Authorization: 'invalid-token',
      },
    };

    const response = await handler(event);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(500);
    expect(body.success).toBe(false);
  });
}); 