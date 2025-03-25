const { connectToDatabase } = require('../../../auth/src/lib/mongodb');
const response = require('../../../auth/src/lib/response');

const handler = async (event) => {
    try {
        const userId = event.pathParameters['id'];
        const role = event.queryStringParameters['role'] || 'host';

        // Connect to MongoDB
        const db = await connectToDatabase();

        // Check if user exists
        const user = await db.collection('users').findOne({ _id: userId });
        if (!user) {
            return response.error('User not found', 404);
        }

        const query = role == "host" ? {
            "roles.isHost": true
        } : {
            "roles.isHost": false
        }
        if (role == "host" && (!user.hostDetails || !user.hostDetails.verification || !user.hostDetails.verification.status || user.hostDetails.verification.status != 'verified')) {
            return response.error('Host verification pending', 400);
        }
        // Update user
        await db.collection('users').updateOne({ _id: userId }, {
            $set: query
        });

        return response.success({ message: 'User role updated to ' + role + ' successfully' });
    } catch (error) {
        console.error('Update user role error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = {
    handler,
};