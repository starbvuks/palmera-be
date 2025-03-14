const { connectToDatabase } = require('../../../auth/src/lib/mongodb');
const response = require('../../../auth/src/lib/response');

const handler = async(event) => {


    try {
        const userId = event.params['id'];

        // Connect to MongoDB
        const db = await connectToDatabase();
        console.log('db here');

        // Check if user exists
        const user = await db.collection('users').findOne({ _id: userId }, {
            projection: {
                'personalInfo': 1,
                'roles': 1
            }
        });
        if (!user) {
            console.log('user', user);
            return response.error('User not found', 404);
        }
        console.log('user', user);
        return response.success({ user }, 200);
    } catch (error) {
        console.error('Get user error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = {
    handler,
};