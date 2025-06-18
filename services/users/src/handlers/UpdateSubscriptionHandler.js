const { connectToDatabase } = require('../lib/mongodb.js');
const response = require('../lib/response.js');
const { subscriptionsSchema } = require('../lib/userDAL.js');

const handler = async(event) => {
    try {
        const userId = event.pathParameters['id'];
        const updateData = JSON.parse(event.body);

        // Validate input
        const { error } = subscriptionsSchema.validate(updateData);
        if (error) {
            return response.error(error.details[0].message, 400);
        }

        // Connect to MongoDB
        const db = await connectToDatabase();

        // Check if user exists
        const user = await db.collection('users').findOne({ _id: userId });
        if (!user) {
            return response.error('User not found', 404);
        }

        // Update user subscription
        await db.collection('users').updateOne({ _id: userId }, {
            $set: { subscription: updateData }
        });

        // Fetch updated subscription
        const updatedUser = await db.collection('users').findOne({ _id: userId }, { projection: { subscription: 1 } });

        return response.success(updatedUser);
    } catch (error) {
        console.error('Update user subscription error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = { handler };