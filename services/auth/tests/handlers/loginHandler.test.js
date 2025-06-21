const bcrypt = require('bcryptjs');
const { handler } = require('../../src/handlers/loginHandler');
const { mockDb, mockUser, clearMocks } = require('../testHelper');

jest.mock('bcryptjs');

describe('loginHandler', () => {
  beforeEach(() => {
    clearMocks();
    bcrypt.compare.mockClear();
  });

  it('should login user successfully', async () => {
    const event = {
      body: JSON.stringify({
        email: mockUser.email,
        password: 'password123',
      }),
    };

    mockDb.findOne.mockResolvedValueOnce(mockUser);
    bcrypt.compare.mockResolvedValueOnce(true);
    mockDb.insertOne.mockResolvedValueOnce({ insertedId: 'refresh-token-id' });

    const response = await handler(event);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.user.email).toBe(mockUser.email);
    expect(body.data.accessToken).toBeDefined();
    expect(body.data.refreshToken).toBeDefined();
  });

  it('should return error for invalid credentials', async () => {
    const event = {
      body: JSON.stringify({
        email: mockUser.email,
        password: 'wrongpassword',
      }),
    };

    mockDb.findOne.mockResolvedValueOnce(mockUser);
    bcrypt.compare.mockResolvedValueOnce(false);

    const response = await handler(event);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(401);
    expect(body.success).toBe(false);
    expect(body.error).toBe('Invalid credentials');
  });

  it('should return error for non-existent user', async () => {
    const event = {
      body: JSON.stringify({
        email: 'nonexistent@example.com',
        password: 'password123',
      }),
    };

    mockDb.findOne.mockResolvedValueOnce(null);

    const response = await handler(event);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(401);
    expect(body.success).toBe(false);
    expect(body.error).toBe('Invalid credentials');
  });

  it('should return error for invalid input', async () => {
    const event = {
      body: JSON.stringify({
        email: 'invalid-email',
        password: '',
      }),
    };

    const response = await handler(event);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(400);
    expect(body.success).toBe(false);
  });
}); 