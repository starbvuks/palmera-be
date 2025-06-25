const { connectToDatabase } = require('../lib/mongodb');
const response = require('../lib/response');
const {
    propertySchema
} = require('../lib/propertiesDAL.js');
const { v4: uuidv4 } = require('uuid');

const handler = async (event) => {
    try {
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
            _id: uuidv4(), // Generate unique ID
            metadata: {
                created_at: new Date(),
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

        // Create property listing
        try {
            await db.collection('properties').insertOne(propertyData);
        } catch (insertError) {
            console.error("Property creation error:", insertError);
            if (insertError.code === 11000) {
                return response.error("Property already exists", 409);
            }
            return response.error("Failed to create property", 500);
        }

        return response.success({
            message: "Property created successfully",
            propertyData
        });
    } catch (error) {
        console.error('Create property error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = {
    handler,
};