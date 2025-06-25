const { connectToDatabase } = require('../lib/mongodb');
const response = require('../lib/response');

const handler = async(event) => {
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

        // Check if user exists and get preferences
        let preferences;
        try {
            preferences = await db.collection('users').findOne({ _id: userId }, {
                projection: {
                    'preferences': 1
                }
            });
        } catch (queryError) {
            console.error("Database query error:", queryError);
            return response.error("Failed to retrieve user preferences", 500);
        }

        if (!preferences) {
            return response.error('User not found', 404);
        }

        return response.success({ 
            preferences: preferences.preferences || {},
            message: "User preferences retrieved successfully"
        }, 200);
    } catch (error) {
        console.error('Get user preferences error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = {
    handler,
};