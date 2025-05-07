const { connectToDatabase } = require('../../../auth/src/lib/mongodb');
const response = require('../../../auth/src/lib/response');

const handler = async (event) => {
    try {
        const userId = event.pathParameters['id'];

        // Connect to MongoDB
        const db = await connectToDatabase();
        // Get all properties that belong to the user
        const properties = await db.collection('properties').find({ host_id: userId }).toArray();
        if (!properties.length) {
            return response.error('No properties found for this user', 404);
        }
        return response.success({ properties }, 200);
    } catch (error) {
        console.error('Get properties error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = {
    handler,
};