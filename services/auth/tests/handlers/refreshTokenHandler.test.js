const jwt = require('jsonwebtoken');
const { handler } = require('../../src/handlers/refreshTokenHandler');
const { mockDb, mockUser, generateTestToken, clearMocks } = require('../testHelper');

describe('refreshTokenHandler', () => {
  beforeEach(() => {
    clearMocks();
  });

  it('should refresh token successfully', async () => {
    const refreshToken = generateTestToken(mockUser._id);
    const event = {
      body: JSON.stringify({ refreshToken }),
    };

    mockDb.findOne.mockResolvedValueOnce({
      userId: mockUser._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // expires in 24h
    });

    const response = await handler(event);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.accessToken).toBeDefined();
  });

  it('should return error for expired refresh token', async () => {
    const refreshToken = generateTestToken(mockUser._id);
    const event = {
      body: JSON.stringify({ refreshToken }),
    };

    mockDb.findOne.mockResolvedValueOnce(null);

    const response = await handler(event);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(401);
    expect(body.success).toBe(false);
    expect(body.error).toBe('Invalid refresh token');
  });

  it('should return error for invalid token format', async () => {
    const event = {
      body: JSON.stringify({ refreshToken: 'invalid-token' }),
    };

    const response = await handler(event);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(401);
    expect(body.success).toBe(false);
    expect(body.error).toBe('Invalid refresh token');
  });

  it('should return error for missing refresh token', async () => {
    const event = {
      body: JSON.stringify({}),
    };

    const response = await handler(event);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(400);
    expect(body.success).toBe(false);
  });
}); 