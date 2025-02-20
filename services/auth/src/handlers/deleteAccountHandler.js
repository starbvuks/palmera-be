const { connectToDatabase } = require('../lib/mongodb');
const response = require('../lib/response');

const handler = async (event) => {
  try {
    const userId = event.requestContext.authorizer.principalId;
    const db = await connectToDatabase();

    // Delete user
    const result = await db.collection('users').deleteOne({ _id: userId });

    if (result.deletedCount === 0) {
      return response.error('User not found', 404);
    }

    // Delete all refresh tokens
    await db.collection('refreshTokens').deleteMany({ userId });

    return response.success({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    return response.error('Internal server error', 500);
  }
};

module.exports = {
  handler,
}; 