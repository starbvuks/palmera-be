const { connectToDatabase } = require('../lib/mongodb');
const response = require('../lib/response');

const handler = async(event) => {
    try {
        const userId = event.pathParameters['id'];

        // Connect to MongoDB
        const db = await connectToDatabase();

        // Check if user exists
        const preferences = await db.collection('users').findOne({ _id: userId }, {
            projection: {
                'preferences': 1
            }
        });
        if (!preferences) return response.error('User not found', 404);

        return response.success({ preferences }, 200);
    } catch (error) {
        console.error('Get user error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = {
    handler,
};