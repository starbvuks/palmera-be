const { connectToDatabase } = require('../../../auth/src/lib/mongodb');
const response = require('../../../auth/src/lib/response');

const handler = async (event) => {
    try {
        const propertyId = event.pathParameters['id'];

        // Connect to MongoDB
        const db = await connectToDatabase();

        // Create propertylisting
        await db.collection('properties').deleteOne({ _id: propertyId });

        return response.success({
            message: 'Property deleted by admin successfully'
        });
    } catch (error) {
        console.error('delete property by admin error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = {
    handler,
};