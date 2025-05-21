const { connectToDatabase } = require('../lib/mongodb');
const response = require('../lib/response');

const handler = async (event) => {
    try {
      const userId = event.pathParameters['id'];
      const db = await connectToDatabase();
      const user = await db.collection('users').findOne({ _id: userId });
      if (!user) {
        return response.error('User not found', 404);
      }
      return response.success({ user }); // Return the full user object
    } catch (error) {
      return response.error('Internal server error', 500);
    }
  };

module.exports = {
    handler,
};