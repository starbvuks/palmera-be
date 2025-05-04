const { connectToDatabase } = require('../../../auth/src/lib/mongodb');
const response = require('../../../auth/src/lib/response');

const handler = async (event) => {


    try {
        const userId = event.pathParameters['id'];

        // Connect to MongoDB
        const db = await connectToDatabase();
        // Check if notification exists
        const notifications = await db.collection('notifications').find({ $or: [{ isSystemNotification: true }, { userId: userId }] }).toArray();
        if (!notifications) {
            return response.error('No notifications found for this user', 404);
        }
        return response.success({ notifications }, 200);
    } catch (error) {
        console.error('Get notification error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = {
    handler,
};