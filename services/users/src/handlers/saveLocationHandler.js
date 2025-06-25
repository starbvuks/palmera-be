const { connectToDatabase } = require('../lib/mongodb');
const response = require('../lib/response');
const {
    savedItemsSchema
} = require('../lib/userDAL.js');

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

        // Validate request body
        if (!event.body) {
            return response.error("Request body is required", 400);
        }

        let requestData;
        try {
            requestData = JSON.parse(event.body);
        } catch (parseError) {
            console.error("JSON parse error:", parseError);
            return response.error("Invalid JSON in request body", 400);
        }

        const { favoriteProperties } = requestData;

        // Validate input
        if (!Array.isArray(favoriteProperties) || !favoriteProperties.every(id => typeof id === 'string')) {
            return response.error('favoriteProperties must be an array of strings', 400);
        }

        // Connect to MongoDB
        let db;
        try {
            db = await connectToDatabase();
        } catch (dbError) {
            console.error("Database connection error:", dbError);
            return response.error("Database connection failed", 503);
        }

        // Check if user exists
        let user;
        try {
            user = await db.collection('users').findOne({ _id: userId });
        } catch (queryError) {
            console.error("Database query error:", queryError);
            return response.error("Failed to retrieve user", 500);
        }

        if (!user) {
            return response.error('User not found', 404);
        }

        const propertiesCollection = db.collection('properties');

        const unValidProperties = [];

        // Validate that all properties exist
        try {
            for (const propertyId of favoriteProperties) {
                const propertyExists = await propertiesCollection.findOne({ _id: propertyId });
                if (!propertyExists) {
                    unValidProperties.push(propertyId);
                }
            }
        } catch (propertyQueryError) {
            console.error("Property validation error:", propertyQueryError);
            return response.error("Failed to validate properties", 500);
        }

        if (unValidProperties.length > 0) {
            return response.error(`Properties not found: ${unValidProperties.join(', ')}`, 404);
        }

        // Update Saved Items
        try {
            await db.collection('users').updateOne({ _id: userId }, {
                $set: {
                    "savedItems.favoriteProperties": favoriteProperties
                }
            });
        } catch (updateError) {
            console.error("Save location update error:", updateError);
            return response.error("Failed to save user locations", 500);
        }

        return response.success({
            message: 'User saved items updated successfully',
            savedCount: favoriteProperties.length
        });
    } catch (error) {
        console.error('Update user saved locations error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = {
    handler,
};