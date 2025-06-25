const { connectToDatabase } = require('../lib/mongodb');
const response = require('../lib/response');

const handler = async (event) => {
    try {
        // Validate path parameters
        if (!event.pathParameters || !event.pathParameters.id) {
            return response.error("Property ID is required", 400);
        }

        const propertyId = event.pathParameters.id;

        // Validate property ID format (basic validation)
        if (!propertyId || typeof propertyId !== 'string' || propertyId.trim() === '') {
            return response.error("Invalid property ID format", 400);
        }

        // Connect to MongoDB
        let db;
        try {
            db = await connectToDatabase();
        } catch (dbError) {
            console.error("Database connection error:", dbError);
            return response.error("Database connection failed", 503);
        }

        // Check if property exists
        let existingProperty;
        try {
            existingProperty = await db.collection('properties').findOne({ _id: propertyId });
        } catch (queryError) {
            console.error("Database query error:", queryError);
            return response.error("Failed to retrieve property", 500);
        }

        if (!existingProperty) {
            return response.error('Property not found', 404);
        }

        // Delete property
        try {
            await db.collection('properties').deleteOne({ _id: propertyId });
        } catch (deleteError) {
            console.error("Property deletion error:", deleteError);
            return response.error("Failed to delete property", 500);
        }

        return response.success({
            message: 'Property deleted successfully',
            propertyId
        });
    } catch (error) {
        console.error('Delete property error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = {
    handler,
};