const { connectToDatabase } = require('../lib/mongodb');
const response = require('../lib/response');

const handler = async (event) => {
    try {
        // Validate path parameters
        if (!event.pathParameters || !event.pathParameters.id) {
            return response.error("User ID is required", 400);
        }

        const userId = event.pathParameters.id;

        // Validate user ID format (basic validation)
        if (!userId || typeof userId !== 'string' || userId.trim() === '') {
            return response.error("Invalid user ID format", 400);
        }

        // Connect to MongoDB
        let db;
        try {
            db = await connectToDatabase();
        } catch (dbError) {
            console.error("Database connection error:", dbError);
            return response.error("Database connection failed", 503);
        }

        // Get user notifications
        let notifications;
        try {
            notifications = await db.collection('notifications').find(
                { $or: [{ isSystemNotification: true }, { userId: userId }] }
            ).toArray();
        } catch (queryError) {
            console.error("Database query error:", queryError);
            return response.error("Failed to retrieve notifications", 500);
        }

        if (!notifications || notifications.length === 0) {
            return response.error('No notifications found for this user', 404);
        }

        return response.success({ 
            notifications,
            count: notifications.length,
            message: "User notifications retrieved successfully"
        }, 200);
    } catch (error) {
        console.error('Get user notifications error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = {
    handler,
};