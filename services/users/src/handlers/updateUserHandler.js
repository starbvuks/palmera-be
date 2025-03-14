const { connectToDatabase } = require('../../../auth/src/lib/mongodb');
const response = require('../../../auth/src/lib/response');
const {
    personalInfoSchema
} = require('../lib/userDAL.js');

const handler = async(event) => {
    try {
        const userId = event.params['id'];
        console.log(event.body);
        const updateData = JSON.parse(event.body);

        // Validate input
        const { error } = personalInfoSchema.validate(updateData);
        if (error) {
            console.log(error);
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
                personalInfo: updateData
            }
        });

        return response.success({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Update user error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = {
    handler,
};