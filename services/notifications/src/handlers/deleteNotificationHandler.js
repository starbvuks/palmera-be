const { connectToDatabase } = require('../lib/mongodb');
const response = require('../lib/response');

const handler = async (event) => {
    try {
        // Validate path parameters
        if (!event.pathParameters || !event.pathParameters.id) {
            return response.error("Notification ID is required", 400);
        }

        const notificationId = event.pathParameters.id;

        // Validate notification ID format (basic validation)
        if (!notificationId || typeof notificationId !== 'string' || notificationId.trim() === '') {
            return response.error("Invalid notification ID format", 400);
        }

        // Connect to MongoDB
        let db;
        try {
            db = await connectToDatabase();
        } catch (dbError) {
            console.error("Database connection error:", dbError);
            return response.error("Database connection failed", 503);
        }

        // Check if notification exists before deleting
        let existingNotification;
        try {
            existingNotification = await db.collection('notifications').findOne({ _id: notificationId });
        } catch (queryError) {
            console.error("Database query error:", queryError);
            return response.error("Failed to retrieve notification", 500);
        }

        if (!existingNotification) {
            return response.error('Notification not found', 404);
        }

        // Delete notification
        try {
            const deleteResult = await db.collection('notifications').deleteOne({ _id: notificationId });

            if (deleteResult.deletedCount === 0) {
                return response.error("Failed to delete notification", 500);
            }
        } catch (deleteError) {
            console.error("Notification deletion error:", deleteError);
            return response.error("Failed to delete notification", 500);
        }

        return response.success({ 
            message: 'Notification deleted successfully',
            notificationId
        });
    } catch (error) {
        console.error('Delete notification error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = {
    handler,
};