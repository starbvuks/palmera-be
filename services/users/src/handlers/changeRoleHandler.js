const { connectToDatabase } = require('../../../auth/src/lib/mongodb');
const response = require('../../../auth/src/lib/response');

const handler = async(event) => {
    try {
        const userId = event.pathParameters['id'];

        // Connect to MongoDB
        const db = await connectToDatabase();

        // Check if user exists
        const user = await db.collection('users').findOne({ _id: userId });
        if (!user) {
            return response.error('User not found', 404);
        }

        // Update user
        await db.collection('users').updateOne({ _id: userId }, {
            $set: {
                "roles.isHost": true
            }
        });

        return response.success({ message: 'User role updated successfully' });
    } catch (error) {
        console.error('Update user role error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = {
    handler,
};