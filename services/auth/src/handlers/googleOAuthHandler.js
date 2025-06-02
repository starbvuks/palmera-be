const { OAuth2Client } = require('google-auth-library');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const { connectToDatabase } = require('../lib/mongodb');
const { googleAuthSchema } = require('../lib/userDAL');
const response = require('../lib/response');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
  const refreshToken = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

const handler = async (event) => {
  try {
    const { idToken } = JSON.parse(event.body);

    // Validate input
    const { error } = googleAuthSchema.validate({ idToken });
    if (error) {
      return response.error(error.details[0].message, 400);
    }

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, given_name: firstName, family_name: lastName, picture } = payload;

    // Connect to database
    const db = await connectToDatabase();

    // Check if user exists
    let user = await db.collection('users').findOne({ email });

    if (!user) {
      // Create new user
      user = {
        _id: uuidv4(),
        email,
        firstName,
        lastName,
        picture,
        role: 'user',
        authProvider: 'google',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await db.collection('users').insertOne(user);
    }

    // Generate tokens
    const tokens = generateTokens(user._id);

    // Store refresh token
    await db.collection('refreshTokens').insertOne({
      userId: user._id,
      token: tokens.refreshToken,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    return response.success({
      user,
      ...tokens,
    });
  } catch (error) {
    console.error('Google auth error:', error);
    return response.error('Authentication failed', 401);
  }
};

module.exports = {
  handler,
}; 