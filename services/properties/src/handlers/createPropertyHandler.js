const { connectToDatabase } = require('../lib/mongodb');
const response = require('../lib/response');
const {
    propertySchema
} = require('../lib/propertiesDAL.js');
const { v4: uuidv4 } = require('uuid');

const handler = async (event) => {
    try {
        const requestData = JSON.parse(event.body);
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
            console.error(error);
            return response.error(error.details[0].message, 400);
        }

        propertyData = propertySchema.validate(Data).value;
        // Connect to MongoDB
        const db = await connectToDatabase();

        // Create propertylisting
        await db.collection('properties').insertOne(propertyData);

        return response.success({
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