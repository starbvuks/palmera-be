const { connectToDatabase } = require('../lib/mongodb');
const response = require('../lib/response');

const handler = async (event) => {
  try {
    const token = event.headers.Authorization.split(' ')[1];
    const db = await connectToDatabase();

    // Remove refresh token
    await db.collection('refreshTokens').deleteMany({
      token,
    });

    return response.success({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return response.error('Internal server error', 500);
  }
};

module.exports = {
  handler,
}; 