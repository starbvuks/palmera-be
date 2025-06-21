const { connectToDatabase } = require('../lib/mongodb');
const response = require('../lib/response');

const handler = async(event) => {
    try {
        const userId = event.pathParameters['id'];

        // Connect to MongoDB
        const db = await connectToDatabase();

        // Check if user exists
        const subscription = await db.collection('users').findOne({ _id: userId }, {
            projection: {
                'subscription': 1
            }
        });
        if (!subscription) return response.error('User not found', 404);

        return response.success({ subscription }, 200);
    } catch (error) {
        console.error('Get user subscription error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = {
    handler,
};