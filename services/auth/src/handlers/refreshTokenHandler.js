const jwt = require('jsonwebtoken');
const { connectToDatabase } = require('../lib/mongodb');
const { refreshTokenSchema } = require('../lib/validationSchemas');
const response = require('../lib/response');

const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const handler = async (event) => {
  try {
    const { refreshToken } = JSON.parse(event.body);

    // Validate input
    const { error } = refreshTokenSchema.validate({ refreshToken });
    if (error) {
      return response.error(error.details[0].message, 400);
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    } catch (err) {
      return response.error('Invalid refresh token', 401);
    }

    // Connect to database
    const db = await connectToDatabase();

    // Check if refresh token exists and is valid
    const storedToken = await db.collection('refreshTokens').findOne({
      userId: decoded.userId,
      token: refreshToken,
      expiresAt: { $gt: new Date() },
    });

    if (!storedToken) {
      return response.error('Invalid refresh token', 401);
    }

    // Generate new access token
    const accessToken = generateAccessToken(decoded.userId);

    return response.success({ accessToken });
  } catch (error) {
    console.error('Refresh token error:', error);
    return response.error('Internal server error', 500);
  }
};

module.exports = {
  handler,
}; 