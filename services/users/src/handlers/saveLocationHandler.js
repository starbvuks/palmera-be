const { connectToDatabase } = require('../lib/mongodb');
const response = require('../lib/response');
const {
    savedItemsSchema
} = require('../lib/userDAL.js');

const handler = async(event) => {
    try {
        const userId = event.pathParameters['id'];

        const { favoriteProperties } = JSON.parse(event.body);

        // Validate input
        if (!Array.isArray(favoriteProperties) || !favoriteProperties.every(id => typeof id === 'string')) {
            return response.error('favoriteProperties must be an array of strings', 400);
        }

        // Connect to MongoDB
        const db = await connectToDatabase();

        // Check if user exists
        const user = await db.collection('users').findOne({ _id: userId });
        if (!user) {
            return response.error('User not found', 404);
        }

        const propertiesCollection = db.collection('properties');

        const unValidProperties = [];

        for (const propertyId of favoriteProperties) {
            const propertyExists = await propertiesCollection.findOne({ _id: propertyId });
            if (!propertyExists) {
                unValidProperties.push(propertyId);
            }
        }

        if (unValidProperties.length > 0) {
            return response.error(`Properties not found: ${unValidProperties.join(', ')}`, 404);
        }


        // Update Saved Items
        await db.collection('users').updateOne({ _id: userId }, {
            $set: {
                "savedItems.favoriteProperties": favoriteProperties
            }
        });

        return response.success({
            message: 'User saved items updated successfully '
        });
    } catch (error) {
        console.error('Update user saved locations error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = {
    handler,
};