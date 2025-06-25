const jwt = require('jsonwebtoken');
const { connectToDatabase } = require('../lib/mongodb');
const { refreshTokenSchema } = require('../lib/userDAL');
const response = require('../lib/response');

const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const handler = async (event) => {
  try {
    // Parse request body
    let requestBody;
    try {
      requestBody = JSON.parse(event.body);
    } catch (parseError) {
      return response.error('Invalid JSON in request body', 400);
    }

    const { refreshToken } = requestBody;

    // Validate input
    const { error } = refreshTokenSchema.validate({ refreshToken });
    if (error) {
      return response.error(`Validation error: ${error.details[0].message}`, 400);
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      
      if (jwtError.name === 'TokenExpiredError') {
        return response.error('Refresh token has expired', 401);
      } else if (jwtError.name === 'JsonWebTokenError') {
        return response.error('Invalid refresh token', 401);
      } else if (jwtError.name === 'NotBeforeError') {
        return response.error('Refresh token not yet valid', 401);
      } else {
        return response.error('Invalid refresh token', 401);
      }
    }

    // Validate decoded token structure
    if (!decoded.userId) {
      return response.error('Invalid token structure', 401);
    }

    // Connect to database
    let db;
    try {
      db = await connectToDatabase();
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return response.error('Database connection failed', 503);
    }

    // Check if user exists
    const user = await db.collection('users').findOne({ _id: decoded.userId });
    if (!user) {
      return response.error('User not found', 404);
    }

    // Check if account is active
    if (user.accountStatus && user.accountStatus.status === 'suspended') {
      return response.error('Account has been suspended. Please contact support.', 403);
    }

    if (user.accountStatus && user.accountStatus.status === 'deactivated') {
      return response.error('Account has been deactivated. Please contact support.', 403);
    }

    // Check if refresh token exists and is valid
    const storedToken = await db.collection('refreshTokens').findOne({
      userId: decoded.userId,
      token: refreshToken,
      expiresAt: { $gt: new Date() },
    });

    if (!storedToken) {
      return response.error('Refresh token not found or expired', 401);
    }

    // Generate new access token
    let accessToken;
    try {
      accessToken = generateAccessToken(decoded.userId);
    } catch (tokenError) {
      console.error('Access token generation error:', tokenError);
      return response.error('Authentication service error', 500);
    }

    return response.success({ 
      accessToken,
      expiresIn: 3600 // 1 hour in seconds
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    return response.error('Internal server error', 500);
  }
};

module.exports = {
  handler,
}; 