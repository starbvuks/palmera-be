const { handler } = require('../../src/handlers/deleteAccountHandler');
const { mockDb, mockUser, clearMocks } = require('../testHelper');

describe('deleteAccountHandler', () => {
  beforeEach(() => {
    clearMocks();
  });

  it('should delete account successfully', async () => {
    const event = {
      requestContext: {
        authorizer: {
          principalId: mockUser._id,
        },
      },
    };

    mockDb.deleteOne.mockResolvedValueOnce({ deletedCount: 1 });
    mockDb.deleteMany.mockResolvedValueOnce({ deletedCount: 1 });

    const response = await handler(event);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.message).toBe('Account deleted successfully');
  });

  it('should return error if user not found', async () => {
    const event = {
      requestContext: {
        authorizer: {
          principalId: 'non-existent-id',
        },
      },
    };

    mockDb.deleteOne.mockResolvedValueOnce({ deletedCount: 0 });

    const response = await handler(event);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(404);
    expect(body.success).toBe(false);
    expect(body.error).toBe('User not found');
  });

  it('should handle missing user ID', async () => {
    const event = {
      requestContext: {
        authorizer: {},
      },
    };

    const response = await handler(event);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(500);
    expect(body.success).toBe(false);
  });
}); 