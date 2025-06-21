const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { connectToDatabase } = require('../lib/mongodb');
const { loginSchema } = require('../lib/userDAL');
const response = require('../lib/response');

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1d' });
  const refreshToken = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

const handler = async (event) => {
  try {
    const { email, password } = JSON.parse(event.body);

    // Validate input
    const { error } = loginSchema.validate({ email, password });
    if (error) {
      return response.error(error.details[0].message, 400);
    }

    // Connect to database
    const db = await connectToDatabase();

    // Find user
    const user = await db.collection('users').findOne({ "personalInfo.email": email });
    if (!user) {
      return response.error('Invalid credentials', 401);
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.authentication.passwordHash);
    if (!validPassword) {
      return response.error('Invalid credentials', 401);
    }

    // Generate tokens
    const tokens = generateTokens(user._id);

    // Store refresh tokens
    await db.collection('refreshTokens').insertOne({
      userId: user._id,
      token: tokens.refreshToken,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return response.success({
      user: userWithoutPassword,
      ...tokens,
    });
  } catch (error) {
    console.error('Login error:', error);
    return response.error('Internal server error', 500);
  }
};

module.exports = {
  handler,
};