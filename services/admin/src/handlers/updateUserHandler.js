const { connectToDatabase } = require('../lib/mongodb');
const response = require('../lib/response');
const {
    userSchema
} = require('../lib/userDAL.js');

const handler = async (event) => {
    try {
        const userId = event.pathParameters['id'];
        const updateData = JSON.parse(event.body);

        // Validate input
        const { error } = userSchema.validate(updateData);
        if (error) {
            console.error(error);
            return response.error(error.details[0].message, 400);
        }

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
                ...updateData,
                "accountStatus.updatedAt": new Date()
            }
        });

        return response.success({ message: 'User updated by admin successfully' });
    } catch (error) {
        console.error('Update user by admin error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = {
    handler,
};