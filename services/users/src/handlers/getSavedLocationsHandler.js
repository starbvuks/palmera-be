const { connectToDatabase } = require('../../../auth/src/lib/mongodb');
const response = require('../../../auth/src/lib/response');

const handler = async(event) => {
    try {
        const userId = event.params['id'];

        // Connect to MongoDB
        const db = await connectToDatabase();

        // Check if user exists
        const user = await db.collection('users').findOne({ _id: userId }, {
            projection: {
                'savedItems.favoriteProperties': 1
            }
        });
        if (!user) return response.error('User not found', 404);
        const savedLocations = (user.savedItems && user.savedItems.favoriteProperties) ?
            user.savedItems.favoriteProperties : [];
        return response.success({ savedLocations }, 200);
    } catch (error) {
        console.error('Get favorite locations error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = {
    handler,
};