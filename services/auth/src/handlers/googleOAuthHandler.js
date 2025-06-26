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
    // Parse request body
    let requestBody;
    try {
      requestBody = JSON.parse(event.body);
    } catch (parseError) {
      return response.error('Invalid JSON in request body', 400);
    }

    const { idToken } = requestBody;

    // Validate input
    const { error } = googleAuthSchema.validate({ idToken });
    if (error) {
      return response.error(`Validation error: ${error.details[0].message}`, 400);
    }

    // Verify Google token
    let ticket;
    try {
      ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
    } catch (googleError) {
      console.error('Google token verification error:', googleError);
      
      if (googleError.message.includes('Token used too late')) {
        return response.error('Google token has expired', 401);
      } else if (googleError.message.includes('Invalid token')) {
        return response.error('Invalid Google token', 401);
      } else if (googleError.message.includes('Wrong audience')) {
        return response.error('Invalid Google client configuration', 500);
      } else {
        return response.error('Google authentication failed', 401);
      }
    }

    const payload = ticket.getPayload();
    const { email, given_name: firstName, family_name: lastName, picture } = payload;

    // Validate required fields from Google
    if (!email) {
      return response.error('Email is required from Google account', 400);
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
    let user = await db.collection('users').findOne({ "personalInfo.email": email });

    if (!user) {
      // Create new user
      try {
        user = {
          _id: uuidv4(),
          personalInfo: {
            email,
            firstName: firstName || '',
            lastName: lastName || '',
            phone: null
          },
          roles: {
            isHost: false,
            isSuperhost: false,
            isAdmin: false
          },
          accountStatus: {
            status: 'active',
            verified: true
          },
          authentication: {
            provider: 'google',
            googleId: payload.sub
          },
          profile: {
            picture: picture || null
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await db.collection('users').insertOne(user);
      } catch (userCreationError) {
        console.error('User creation error:', userCreationError);
        
        // Check if it's a duplicate key error
        if (userCreationError.code === 11000) {
          return response.error('User account already exists', 409);
        }
        
        return response.error('Failed to create user account', 500);
      }
    } else {
      // Check if existing user account is active
      if (user.accountStatus && user.accountStatus.status === 'suspended') {
        return response.error('Account has been suspended. Please contact support.', 403);
      }

      if (user.accountStatus && user.accountStatus.status === 'deactivated') {
        return response.error('Account has been deactivated. Please contact support.', 403);
      }

      // Update user's Google authentication info
      try {
        await db.collection('users').updateOne(
          { _id: user._id },
          {
            $set: {
              'authentication.provider': 'google',
              'authentication.googleId': payload.sub,
              'profile.picture': picture || user.profile?.picture,
              updatedAt: new Date()
            }
          }
        );
      } catch (updateError) {
        console.error('User update error:', updateError);
        // Continue with login even if update fails
      }
    }

    // Generate tokens
    let tokens;
    try {
      tokens = generateTokens(user._id);
    } catch (tokenError) {
      console.error('Token generation error:', tokenError);
      return response.error('Authentication service error', 500);
    }

    // Store refresh token
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

    // Remove sensitive data from response
    const { authentication: _, ...userResponse } = user;

    return response.success({
      user: userResponse,
      ...tokens,
    });
  } catch (error) {
    console.error('Google auth error:', error);
    return response.error('Internal server error', 500);
  }
};

module.exports = {
  handler,
}; 