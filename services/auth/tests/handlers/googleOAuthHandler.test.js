const { OAuth2Client } = require('google-auth-library');
const { handler } = require('../../src/handlers/googleOAuthHandler');
const { mockDb, mockUser, clearMocks } = require('../testHelper');

jest.mock('google-auth-library');

describe('googleOAuthHandler', () => {
  const mockTicket = {
    getPayload: jest.fn().mockReturnValue({
      email: mockUser.email,
      given_name: mockUser.firstName,
      family_name: mockUser.lastName,
      picture: 'https://example.com/picture.jpg',
    }),
  };

  beforeEach(() => {
    clearMocks();
    OAuth2Client.prototype.verifyIdToken = jest.fn().mockResolvedValue(mockTicket);
  });

  it('should authenticate new user with Google successfully', async () => {
    const event = {
      body: JSON.stringify({
        idToken: 'valid-google-token',
      }),
    };

    mockDb.findOne.mockResolvedValueOnce(null);
    mockDb.insertOne.mockResolvedValueOnce({ insertedId: mockUser._id });

    const response = await handler(event);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.user.email).toBe(mockUser.email);
    expect(body.data.user.authProvider).toBe('google');
    expect(body.data.accessToken).toBeDefined();
    expect(body.data.refreshToken).toBeDefined();
  });

  it('should authenticate existing user with Google successfully', async () => {
    const event = {
      body: JSON.stringify({
        idToken: 'valid-google-token',
      }),
    };

    mockDb.findOne.mockResolvedValueOnce(mockUser);
    mockDb.insertOne.mockResolvedValueOnce({ insertedId: 'refresh-token-id' });

    const response = await handler(event);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.user.email).toBe(mockUser.email);
    expect(body.data.accessToken).toBeDefined();
    expect(body.data.refreshToken).toBeDefined();
  });

  it('should return error for invalid Google token', async () => {
    const event = {
      body: JSON.stringify({
        idToken: 'invalid-token',
      }),
    };

    OAuth2Client.prototype.verifyIdToken = jest.fn().mockRejectedValue(new Error('Invalid token'));

    const response = await handler(event);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(401);
    expect(body.success).toBe(false);
    expect(body.error).toBe('Authentication failed');
  });

  it('should return error for missing idToken', async () => {
    const event = {
      body: JSON.stringify({}),
    };

    const response = await handler(event);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(400);
    expect(body.success).toBe(false);
  });
}); 