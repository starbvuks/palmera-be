const { connectToDatabase } = require('../lib/mongodb.js');
const response = require('../lib/response.js');

const handler = async (event) => {
    try {
        // Validate path parameters
        if (!event.pathParameters || !event.pathParameters.id) {
            return response.error("User ID is required", 400);
        }

        const userId = event.pathParameters.id;

        // Validate user ID format (basic validation)
        if (!userId || typeof userId !== 'string' || userId.trim() === '') {
            return response.error("Invalid user ID format", 400);
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
        let conversations;
        try {
            conversations = await db.collection('conversations').find(
                { $or: [{ host_id: userId }, { guest_id: userId }] }, 
                { messages: 0 }
            ).toArray();
        } catch (queryError) {
            console.error("Database query error:", queryError);
            return response.error("Failed to retrieve conversations", 500);
        }

        if (!conversations || conversations.length === 0) {
            return response.error('No conversations found for this user', 404);
        }

        const conversationsWithOutMessages = conversations.map(conversation => {
            const { messages, ...rest } = conversation;
            return rest;
        });

        return response.success({ 
            conversations: conversationsWithOutMessages,
            count: conversationsWithOutMessages.length
        }, 200);
    } catch (error) {
        console.error('Get user conversations error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = {
    handler,
};