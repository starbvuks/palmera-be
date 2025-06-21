const { connectToDatabase } = require('../lib/mongodb');
const response = require('../lib/response');

const handler = async (event) => {


    try {
        const userId = event.pathParameters['id'];

        // Connect to MongoDB
        const db = await connectToDatabase();
        // Check if notifications exist
        const notifications = await db.collection('notifications').find({ recipient_id: userId }).toArray();
        if (!notifications.length) {
            return response.error('No notifications found for this user', 404);
        }
        return response.success({ notifications }, 200);
    } catch (error) {
        console.error('Get notifications error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = {
    handler,
};