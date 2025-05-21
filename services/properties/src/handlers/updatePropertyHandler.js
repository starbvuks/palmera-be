const { connectToDatabase } = require('../lib/mongodb');
const response = require('../lib/response');
const {
    propertySchema
} = require('../lib/propertiesDAL.js');

const handler = async (event) => {
    try {
        propertyId = event.pathParameters['id'];

        const requestData = JSON.parse(event.body);
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
            console.error(error);
            return response.error(error.details[0].message, 400);
        }
        propertyData = propertySchema.validate(Data).value;

        // Connect to MongoDB
        const db = await connectToDatabase();

        // Create propertylisting
        await db.collection('properties').updateOne({ _id: propertyData._id }, { $set: Data });

        return response.success({
            message: 'Property updated successfully'
        });
    } catch (error) {
        console.error('update property error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = {
    handler,
};