const { connectToDatabase } = require('../lib/mongodb.js');
const response = require('../lib/response.js');
const {
    messageSchemaWithConversationDetails,
} = require('../lib/messageDAL.js');
const {
    conversationSchema,
} = require('../lib/messageDAL.js');
const { messageSchema } = require('../lib/messageDAL.js');
const { v4: uuidv4 } = require('uuid');

const handler = async (event) => {
    try {
        const requestData = JSON.parse(event.body);
        var ConversationIdProvided = true;
        if (requestData.ConversationId === undefined ) {
            requestData.ConversationId = uuidv4(); // Generate a new conversation ID if not provided
            ConversationIdProvided = false; // Set flag to indicate that a new conversation ID was generated
        }
        const Data = {
            ...requestData,
            _id: uuidv4(), 
            sentAt: new Date(), // Add sentAt field with current date
        };

        // Validate input
        const { error } = messageSchemaWithConversationDetails.validate(Data);
        if (error) {
            console.error(error);
            return response.error(error.details[0].message, 400);
        }


        completeMessageData = messageSchemaWithConversationDetails.validate(Data).value;
        // Connect to MongoDB
        const db = await connectToDatabase();
        if (!ConversationIdProvided){
            const newConversation = {
                _id: completeMessageData.ConversationId,
                property_id: completeMessageData.property_id,
                host_id: completeMessageData.host_id,
                guest_id: completeMessageData.guest_id,
                messages: [], // Initialize with an empty array of messages
                createdAt: new Date(), // Add createdAt field with current date
            };
            const { error } = conversationSchema.validate(newConversation);
            if (error) {
                console.error(error);
                return response.error(error.details[0].message, 400);
            }
            await db.collection('conversations').insertOne(newConversation);
        }

        messageData = {
            _id: uuidv4(), // Generate a new unique ID for the message
            message: completeMessageData.message,
            sentBy: completeMessageData.sentBy,
            sentAt: completeMessageData.sentAt
        };
        const { msgerror } = messageSchema.validate(messageData);
        if ((msgerror)) {
            console.error((msgerror));
            return response.error((msgerror).details[0].message, 400);
        }
        // add message
        await db.collection("conversations").updateOne(
            { _id: completeMessageData.ConversationId },
            { $push: { messages: messageData } }
        );
        
        return response.success({
            message: 'Message sent successfully',
            ConversationId: completeMessageData.ConversationId,
            messageData
        });
    } catch (error) {
        console.error('Create message error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = {
    handler,
};