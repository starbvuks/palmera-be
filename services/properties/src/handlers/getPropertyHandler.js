const { connectToDatabase } = require('../lib/mongodb');
const response = require('../lib/response');

const handler = async (event) => {


    try {
        const propertyId = event.pathParameters['id'];

        // Connect to MongoDB
        const db = await connectToDatabase();
        // Check if property exists
        const property = await db.collection('properties').findOne({ _id: propertyId });
        if (!property) {
            return response.error('property not found', 404);
        }
        return response.success({ property }, 200);
    } catch (error) {
        console.error('Get property error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = {
    handler,
};