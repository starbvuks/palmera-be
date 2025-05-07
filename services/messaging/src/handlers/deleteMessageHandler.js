const { connectToDatabase } = require('../../../auth/src/lib/mongodb');
const response = require('../../../auth/src/lib/response');

const handler = async (event) => {


    try {
        const conversationId = event.pathParameters['conversationId'];
        // const messageId = event.pathParameters['id'];
        const messageId = event.pathParameters['id'];
        

        // Connect to MongoDB
        const db = await connectToDatabase();
        // Check if conversation exists
        const conversation = await db.collection('conversations').findOne({ _id: conversationId });
        if (!conversation) {
            return response.error('conversation not found', 404);
        }
        const messages = conversation.messages
        // Check if message exists
        let messageExists = false;
        for (const message of messages) {
            if (message._id == messageId) {
                messageExists = true;
                break;
            }
        }
        if (!messageExists) {
            return response.error('message not found', 404);
        }
        filterdMessages = messages.filter(message => message._id !== messageId);
        // Update the conversation with the filtered messages
        await db.collection('conversations').updateOne({ _id: conversationId }, { $set: { messages: filterdMessages } });
        return response.success({ filterdMessages }, 200);
    } catch (error) {
        console.error('Get conversation error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = {
    handler,
};