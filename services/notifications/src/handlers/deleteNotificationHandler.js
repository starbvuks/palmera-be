const { connectToDatabase } = require('../lib/mongodb');
const response = require('../lib/response');

const handler = async (event) => {
    try {
        const notificationId = event.pathParameters['id'];

        // Connect to MongoDB
        const db = await connectToDatabase();

        // Delete notification
        await db.collection('notifications').deleteOne({ _id: notificationId });

        return response.success({ message: 'Notification deleted successfully' });
    } catch (error) {
        console.error('Delete notification error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = {
    handler,
};