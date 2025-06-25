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
    // Parse request body
    let requestBody;
    try {
      requestBody = JSON.parse(event.body);
    } catch (parseError) {
      return response.error('Invalid JSON in request body', 400);
    }

    const { email, password } = requestBody;

    // Validate input
    const { error } = loginSchema.validate({ email, password });
    if (error) {
      return response.error(`Validation error: ${error.details[0].message}`, 400);
    }

    // Connect to database
    let db;
    try {
      db = await connectToDatabase();
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return response.error('Database connection failed', 503);
    }

    // Find user
    const user = await db.collection('users').findOne({ "personalInfo.email": email });
    if (!user) {
      return response.error('Invalid email or password', 401);
    }

    // Check if account is active
    if (user.accountStatus && user.accountStatus.status === 'suspended') {
      return response.error('Account has been suspended. Please contact support.', 403);
    }

    if (user.accountStatus && user.accountStatus.status === 'deactivated') {
      return response.error('Account has been deactivated. Please contact support.', 403);
    }

    // Verify password
    let validPassword;
    try {
      validPassword = await bcrypt.compare(password, user.authentication.passwordHash);
    } catch (bcryptError) {
      console.error('Password comparison error:', bcryptError);
      return response.error('Authentication service error', 500);
    }

    if (!validPassword) {
      return response.error('Invalid email or password', 401);
    }

    // Generate tokens
    let tokens;
    try {
      tokens = generateTokens(user._id);
    } catch (tokenError) {
      console.error('Token generation error:', tokenError);
      return response.error('Authentication service error', 500);
    }

    // Store refresh tokens
    try {
      await db.collection('refreshTokens').insertOne({
        userId: user._id,
        token: tokens.refreshToken,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });
    } catch (tokenStoreError) {
      console.error('Token storage error:', tokenStoreError);
      return response.error('Authentication service error', 500);
    }

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