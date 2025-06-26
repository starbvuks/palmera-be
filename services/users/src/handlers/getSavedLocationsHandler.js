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

        // Check if user exists and get saved locations
        let user;
        try {
            user = await db.collection('users').findOne({ _id: userId }, {
                projection: {
                    'savedItems.favoriteProperties': 1
                }
            });
        } catch (queryError) {
            console.error("Database query error:", queryError);
            return response.error("Failed to retrieve user saved locations", 500);
        }

        if (!user) {
            return response.error('User not found', 404);
        }

        const savedLocations = (user.savedItems && user.savedItems.favoriteProperties) ?
            user.savedItems.favoriteProperties : [];

        return response.success({ 
            savedLocations,
            count: savedLocations.length,
            message: "User saved locations retrieved successfully"
        }, 200);
    } catch (error) {
        console.error('Get favorite locations error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = {
    handler,
};