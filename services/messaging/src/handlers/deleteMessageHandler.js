const { connectToDatabase } = require('../lib/mongodb.js');
const response = require('../lib/response.js');

const handler = async (event) => {
    try {
        // Validate path parameters
        if (!event.pathParameters) {
            return response.error("Path parameters are required", 400);
        }

        const conversationId = event.pathParameters.conversationId;
        const messageId = event.pathParameters.id;

        // Validate required parameters
        if (!conversationId || typeof conversationId !== 'string' || conversationId.trim() === '') {
            return response.error("Conversation ID is required", 400);
        }

        if (!messageId || typeof messageId !== 'string' || messageId.trim() === '') {
            return response.error("Message ID is required", 400);
        }

        // Connect to MongoDB
        let db;
        try {
            db = await connectToDatabase();
        } catch (dbError) {
            console.error("Database connection error:", dbError);
            return response.error("Database connection failed", 503);
        }

        // Check if conversation exists
        let conversation;
        try {
            conversation = await db.collection('conversations').findOne({ _id: conversationId });
        } catch (queryError) {
            console.error("Database query error:", queryError);
            return response.error("Failed to retrieve conversation", 500);
        }

        if (!conversation) {
            return response.error('Conversation not found', 404);
        }

        const messages = conversation.messages || [];
        
        // Check if message exists
        let messageExists = false;
        for (const message of messages) {
            if (message._id == messageId) {
                messageExists = true;
                break;
            }
        }

        if (!messageExists) {
            return response.error('Message not found', 404);
        }

        const filteredMessages = messages.filter(message => message._id !== messageId);
        
        // Update the conversation with the filtered messages
        try {
            const updateResult = await db.collection('conversations').updateOne(
                { _id: conversationId }, 
                { $set: { messages: filteredMessages } }
            );

            if (updateResult.matchedCount === 0) {
                return response.error("Conversation not found during update", 404);
            }

            if (updateResult.modifiedCount === 0) {
                return response.error("Failed to delete message", 500);
            }
        } catch (updateError) {
            console.error("Message deletion error:", updateError);
            return response.error("Failed to delete message", 500);
        }

        return response.success({ 
            message: "Message deleted successfully",
            conversationId,
            messageId,
            remainingMessages: filteredMessages.length
        }, 200);
    } catch (error) {
        console.error('Delete message error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = {
    handler,
};