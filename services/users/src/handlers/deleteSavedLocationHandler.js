const { connectToDatabase } = require('../../../auth/src/lib/mongodb');
const response = require('../../../auth/src/lib/response');

const handler = async(event) => {
    try {
        const userId = event.params['id']
        const locationId = event.params['locationId']

        // Connect to MongoDB
        const db = await connectToDatabase();

        // Check if user exists
        const user = await db.collection('users').findOne({ _id: userId }, { projection: { 'savedItems.favoriteProperties': 1 } });
        if (!user) {
            return response.error('User not found', 404);
        }

        const updatedLocations = user.savedItems.favoriteProperties.filter(id => id !== locationId);


        // Update Saved Items
        await db.collection('users').updateOne({ _id: userId }, {
            $set: {
                "savedItems.favoriteProperties": updatedLocations
            }
        });

        return response.success({
            message: 'Deleted user saved location  successfully '
        });
    } catch (error) {
        console.error('Delete user saved location error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = {
    handler,
};