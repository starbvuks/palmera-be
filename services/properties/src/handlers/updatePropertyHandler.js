const { connectToDatabase } = require('../lib/mongodb');
const response = require('../lib/response');
const {
    updatePropertySchema
} = require('../lib/propertiesDAL.js');
const jwt = require('jsonwebtoken');

const handler = async (event) => {
    try {
        // Extract and verify JWT token
        const authHeader = event.headers.Authorization || event.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return response.error('Authorization header with Bearer token is required', 401);
        }

        const token = authHeader.substring(7);
        let decodedToken;
        try {
            decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        } catch (jwtError) {
            return response.error('Invalid or expired token', 401);
        }

        // Validate path parameters
        if (!event.pathParameters || !event.pathParameters.id) {
            return response.error("Property ID is required", 400);
        }

        const propertyId = event.pathParameters.id;

        // Validate property ID format (basic validation)
        if (!propertyId || typeof propertyId !== 'string' || propertyId.trim() === '') {
            return response.error("Invalid property ID format", 400);
        }

        // Parse request body
        let requestData;
        try {
            requestData = JSON.parse(event.body);
        } catch (parseError) {
            console.error("JSON parse error:", parseError);
            return response.error("Invalid JSON in request body", 400);
        }

        const updateData = {
            ...requestData,
            _id: propertyId,
            metadata: {
                updated_at: new Date(),
            }
        };

        // Validate input using partial update schema
        const { error, value } = updatePropertySchema.validate(updateData);
        if (error) {
            console.error("Validation error:", error);
            return response.error(`Validation error: ${error.details[0].message}`, 400);
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

        // Authorization: Check if user is admin or the property host
        const userId = decodedToken.userId;
        const userRole = decodedToken.role;
        
        if (userRole !== 'admin' && existingProperty.host_id !== userId) {
            return response.error('Unauthorized: Only admins or property hosts can update properties', 403);
        }

        // Prepare update object - only include fields that were provided
        const updateObject = {};
        
        // Only add fields that were actually provided in the request
        if (value.host_id !== undefined) updateObject.host_id = value.host_id;
        
        // Handle nested objects - only update if provided
        if (value.basicInfo) {
            updateObject.basicInfo = { ...existingProperty.basicInfo, ...value.basicInfo };
        }
        
        if (value.location) {
            updateObject.location = { ...existingProperty.location, ...value.location };
        }
        
        if (value.pricing) {
            updateObject.pricing = { ...existingProperty.pricing, ...value.pricing };
        }
        
        if (value.availability) {
            updateObject.availability = { ...existingProperty.availability, ...value.availability };
        }
        
        if (value.amenities) {
            updateObject.amenities = { ...existingProperty.amenities, ...value.amenities };
        }
        
        if (value.media) {
            updateObject.media = { ...existingProperty.media, ...value.media };
        }
        
        if (value.rules) {
            updateObject.rules = { ...existingProperty.rules, ...value.rules };
        }
        
        if (value.verification) {
            updateObject.verification = { ...existingProperty.verification, ...value.verification };
        }
        
        if (value.ratings) {
            updateObject.ratings = { ...existingProperty.ratings, ...value.ratings };
        }
        
        if (value.bookingSettings) {
            updateObject.bookingSettings = { ...existingProperty.bookingSettings, ...value.bookingSettings };
        }
        
        if (value.hostInfo) {
            updateObject.hostInfo = { ...existingProperty.hostInfo, ...value.hostInfo };
        }
        
        if (value.analytics) {
            updateObject.analytics = { ...existingProperty.analytics, ...value.analytics };
        }
        
        if (value.legal) {
            updateObject.legal = { ...existingProperty.legal, ...value.legal };
        }
        
        if (value.additionalDetails) {
            updateObject.additionalDetails = { ...existingProperty.additionalDetails, ...value.additionalDetails };
        }
        
        // Always update metadata
        updateObject.metadata = { ...existingProperty.metadata, ...value.metadata };

        // Update property
        try {
            const result = await db.collection('properties').updateOne(
                { _id: propertyId }, 
                { $set: updateObject }
            );

            if (result.matchedCount === 0) {
                return response.error('Property not found', 404);
            }

            return response.success({
                message: 'Property updated successfully',
                propertyId,
                updatedFields: Object.keys(updateObject)
            });
        } catch (updateError) {
            console.error("Property update error:", updateError);
            return response.error("Failed to update property", 500);
        }
    } catch (error) {
        console.error('Update property error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = {
    handler,
};