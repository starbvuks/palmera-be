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

        // Check if user exists and get subscription
        let subscription;
        try {
            subscription = await db.collection('users').findOne({ _id: userId }, {
                projection: {
                    'subscription': 1
                }
            });
        } catch (queryError) {
            console.error("Database query error:", queryError);
            return response.error("Failed to retrieve user subscription", 500);
        }

        if (!subscription) {
            return response.error('User not found', 404);
        }

        return response.success({ 
            subscription: subscription.subscription || {},
            message: "User subscription retrieved successfully"
        }, 200);
    } catch (error) {
        console.error('Get user subscription error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = {
    handler,
};