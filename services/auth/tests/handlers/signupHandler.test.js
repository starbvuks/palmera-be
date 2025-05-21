const { handler } = require('../../src/handlers/signupHandler');
const { mockDb, mockUser, clearMocks } = require('../testHelper');

describe('signupHandler', () => {
  beforeEach(() => {
    clearMocks();
  });

  it('should create a new user successfully', async () => {
    const event = {
      body: JSON.stringify({
        email: mockUser.email,
        password: 'password123',
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        phone: mockUser.phone,
      }),
    };

    mockDb.findOne.mockResolvedValueOnce(null);
    mockDb.insertOne.mockResolvedValueOnce({ insertedId: mockUser._id });

    const response = await handler(event);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data.email).toBe(mockUser.email);
    expect(body.data.password).toBeUndefined();
  });

  it('should return error if email already exists', async () => {
    const event = {
      body: JSON.stringify({
        email: mockUser.email,
        password: 'password123',
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        phone: mockUser.phone,
      }),
    };

    mockDb.findOne.mockResolvedValueOnce(mockUser);

    const response = await handler(event);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(409);
    expect(body.success).toBe(false);
    expect(body.error).toBe('Email already registered');
  });

  it('should return error for invalid input', async () => {
    const event = {
      body: JSON.stringify({
        email: 'invalid-email',
        password: '123', // too short
        firstName: '',
        lastName: '',
        phone: 'invalid-phone',
      }),
    };

    const response = await handler(event);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(400);
    expect(body.success).toBe(false);
  });
}); 