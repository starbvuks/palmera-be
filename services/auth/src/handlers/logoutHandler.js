const { connectToDatabase } = require('../lib/mongodb');
const response = require('../lib/response');

const handler = async (event) => {
  try {
    // Check if authorization header exists
    if (!event.headers.Authorization) {
      return response.error('Authorization header is required', 401);
    }

    // Extract token from authorization header
    let token;
    try {
      const authHeader = event.headers.Authorization;
      if (!authHeader.startsWith('Bearer ')) {
        return response.error('Invalid authorization header format. Use Bearer token', 401);
      }
      token = authHeader.split(' ')[1];
      
      if (!token) {
        return response.error('Access token is required', 401);
      }
    } catch (parseError) {
      return response.error('Invalid authorization header format', 401);
    }

    // Connect to database
    let db;
    try {
      db = await connectToDatabase();
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return response.error('Database connection failed', 503);
    }

    // Remove refresh token
    try {
      const result = await db.collection('refreshTokens').deleteMany({
        token,
      });

      // Also remove any expired tokens for cleanup
      await db.collection('refreshTokens').deleteMany({
        expiresAt: { $lt: new Date() }
      });

      return response.success({ 
        message: 'Logged out successfully',
        tokensRemoved: result.deletedCount
      });
    } catch (deleteError) {
      console.error('Token deletion error:', deleteError);
      return response.error('Failed to logout. Please try again.', 500);
    }
  } catch (error) {
    console.error('Logout error:', error);
    return response.error('Internal server error', 500);
  }
};

module.exports = {
  handler,
}; 