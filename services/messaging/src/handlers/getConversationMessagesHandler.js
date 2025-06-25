const { connectToDatabase } = require('../lib/mongodb.js');
const response = require('../lib/response.js');

const handler = async (event) => {
    try {
        // Validate path parameters
        if (!event.pathParameters || !event.pathParameters.conversationId) {
            return response.error("Conversation ID is required", 400);
        }

        const conversationId = event.pathParameters.conversationId;

        // Validate conversation ID format (basic validation)
        if (!conversationId || typeof conversationId !== 'string' || conversationId.trim() === '') {
            return response.error("Invalid conversation ID format", 400);
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
        
        return response.success({ 
            messages,
            conversationId,
            messageCount: messages.length
        }, 200);
    } catch (error) {
        console.error('Get conversation messages error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = {
    handler,
};