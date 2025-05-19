const { connectToDatabase } = require('../../../auth/src/lib/mongodb');
const response = require('../../../auth/src/lib/response');
const { preferencesSchema } = require('../lib/userDAL.js');

const handler = async(event) => {
    try {
        const userId = event.pathParameters['id'];
        const updateData = JSON.parse(event.body);

        // Validate input
        const { error } = preferencesSchema.validate(updateData);
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

        // Update user preferences
        await db.collection('users').updateOne({ _id: userId }, {
            $set: { preferences: updateData }
        });

        // Fetch updated preferences
        const updatedUser = await db.collection('users').findOne({ _id: userId }, { projection: { preferences: 1 } });

        return response.success(updatedUser);
    } catch (error) {
        console.error('Update user preferences error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = { handler };