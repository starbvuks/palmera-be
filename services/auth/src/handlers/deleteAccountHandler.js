const { connectToDatabase } = require('../lib/mongodb');
const response = require('../lib/response');

const handler = async (event) => {
  try {
    // Check if user ID is available from authorizer
    if (!event.requestContext || !event.requestContext.authorizer || !event.requestContext.authorizer.principalId) {
      return response.error('Authentication required', 401);
    }

    const userId = event.requestContext.authorizer.principalId;

    // Connect to database
    let db;
    try {
      db = await connectToDatabase();
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return response.error('Database connection failed', 503);
    }

    // Check if user exists
    const user = await db.collection('users').findOne({ _id: userId });
    if (!user) {
      return response.error('User not found', 404);
    }

    // Check if user is admin (prevent admin deletion)
    if (user.roles && user.roles.isAdmin) {
      return response.error('Admin accounts cannot be deleted', 403);
    }

    // Delete user and related data
    try {
      // Delete user
      const deleteResult = await db.collection('users').deleteOne({ _id: userId });

      if (deleteResult.deletedCount === 0) {
        return response.error('Failed to delete user account', 500);
      }

      // Delete all refresh tokens for this user
      const tokenDeleteResult = await db.collection('refreshTokens').deleteMany({ userId });

      // Delete any OTP records for this user
      if (user.personalInfo && user.personalInfo.phone) {
        await db.collection('otp_verifications').deleteMany({ phone: user.personalInfo.phone });
      }

      return response.success({ 
        message: 'Account deleted successfully',
        userDeleted: true,
        tokensRemoved: tokenDeleteResult.deletedCount
      });
    } catch (deleteError) {
      console.error('Account deletion error:', deleteError);
      return response.error('Failed to delete account. Please try again.', 500);
    }
  } catch (error) {
    console.error('Delete account error:', error);
    return response.error('Internal server error', 500);
  }
};

module.exports = {
  handler,
}; 