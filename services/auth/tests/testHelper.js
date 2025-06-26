const jwt = require('jsonwebtoken');

const mockDb = {
  collection: jest.fn().mockReturnThis(),
  findOne: jest.fn(),
  insertOne: jest.fn(),
  deleteOne: jest.fn(),
  deleteMany: jest.fn(),
};

const mockConnect = jest.fn().mockResolvedValue(mockDb);

jest.mock('../src/lib/mongodb', () => ({
  connectToDatabase: () => mockConnect(),
}));

const generateTestToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'test-secret', { expiresIn: '1h' });
};

const mockUser = {
  _id: 'test-user-id',
  email: 'test@example.com',
  password: '$2a$10$testHashedPassword',
  firstName: 'Test',
  lastName: 'User',
  phone: '+1234567890',
  role: 'user',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const clearMocks = () => {
  mockDb.collection.mockClear();
  mockDb.findOne.mockClear();
  mockDb.insertOne.mockClear();
  mockDb.deleteOne.mockClear();
  mockDb.deleteMany.mockClear();
  mockConnect.mockClear();
};

module.exports = {
  mockDb,
  mockConnect,
  generateTestToken,
  mockUser,
  clearMocks,
}; 