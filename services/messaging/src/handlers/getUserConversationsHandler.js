const { connectToDatabase } = require('../../../auth/src/lib/mongodb');
const response = require('../../../auth/src/lib/response');

const handler = async (event) => {


    try {
        const userId = event.pathParameters['id'];

        // Connect to MongoDB
        const db = await connectToDatabase();
        // Check if conversation exists
        const conversations = await db.collection('conversations').find({ $or: [{ host_id: userId }, { guest_id: userId }] }, { messages: 0 }).toArray();
        if (!conversations || conversations.length === 0) {
            return response.error('No conversations found for this user', 404);
        }
        const conversationsWithOutMessages = conversations.map(conversation => {
            const { messages, ...rest } = conversation;
            return rest;
        });
        return response.success({ conversationsWithOutMessages }, 200);
    } catch (error) {
        console.error('Get conversation error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = {
    handler,
};