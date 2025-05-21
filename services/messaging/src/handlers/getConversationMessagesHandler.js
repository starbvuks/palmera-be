const { connectToDatabase } = require('../lib/mongodb.js');
const response = require('../lib/response.js');

const handler = async (event) => {


    try {
        const conversationId = event.pathParameters['id'];

        // Connect to MongoDB
        const db = await connectToDatabase();
        // Check if conversation exists
        const conversation = await db.collection('conversations').findOne({ _id: conversationId });
        if (!conversation) {
            return response.error('conversation not found', 404);
        }
        const messages = conversation.messages
        return response.success({ messages }, 200);
    } catch (error) {
        console.error('Get conversation error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = {
    handler,
};