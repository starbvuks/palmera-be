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

        // Get all properties that belong to the user
        let properties;
        try {
            properties = await db.collection('properties').find({ host_id: userId }).toArray();
        } catch (queryError) {
            console.error("Database query error:", queryError);
            return response.error("Failed to retrieve user properties", 500);
        }

        if (!properties.length) {
            return response.error('No properties found for this user', 404);
        }

        return response.success({ 
            properties,
            count: properties.length,
            message: `Found ${properties.length} properties for user`
        }, 200);
    } catch (error) {
        console.error('Get user properties error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = {
    handler,
};