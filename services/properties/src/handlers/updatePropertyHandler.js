const { connectToDatabase } = require('../lib/mongodb');
const response = require('../lib/response');
const {
    propertySchema
} = require('../lib/propertiesDAL.js');

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

        const Data = {
            ...requestData,
            _id: propertyId,
            metadata: {
                updated_at: new Date(),
            }
        };

        // Validate input
        const { error } = propertySchema.validate(Data);
        if (error) {
            console.error("Validation error:", error);
            return response.error(`Validation error: ${error.details[0].message}`, 400);
        }

        let propertyData;
        try {
            propertyData = propertySchema.validate(Data).value;
        } catch (validationError) {
            console.error("Validation processing error:", validationError);
            return response.error("Invalid property data format", 400);
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

        // Update property
        try {
            await db.collection('properties').updateOne({ _id: propertyData._id }, { $set: Data });
        } catch (updateError) {
            console.error("Property update error:", updateError);
            return response.error("Failed to update property", 500);
        }

        return response.success({
            message: 'Property updated successfully',
            propertyId
        });
    } catch (error) {
        console.error('Update property error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = {
    handler,
};