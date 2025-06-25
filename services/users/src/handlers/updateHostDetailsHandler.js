const { connectToDatabase } = require('../lib/mongodb.js');
const response = require('../lib/response.js');
const { hostDetailsSchema } = require('../lib/userDAL.js');

const handler = async(event) => {
    try {
        const userId = event.pathParameters['id'];
        const updateData = JSON.parse(event.body);

        // Validate input
        const { error } = hostDetailsSchema.validate(updateData);
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

        // Update user host Details
        await db.collection('users').updateOne({ _id: userId }, {
            $set: { hostDetails: updateData }
        });

        // Fetch updated hostDetails
        const updatedUser = await db.collection('users').findOne({ _id: userId }, { projection: { hostDetails: 1 } });

        return response.success(updatedUser);
    } catch (error) {
        console.error('Update user host Details error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = { handler };