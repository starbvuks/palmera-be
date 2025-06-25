const { connectToDatabase } = require("../lib/mongodb.js");
const response = require("../lib/response.js");
const {
  messageSchemaWithConversationDetails,
  conversationSchema,
  messageSchema,
  validateIdsExist,
} = require("../lib/messageDAL.js");
const { v4: uuidv4 } = require("uuid");

const handler = async (event) => {
  try {
    // Validate request body
    if (!event.body) {
      return response.error("Request body is required", 400);
    }

    let requestData;
    try {
      requestData = JSON.parse(event.body);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return response.error("Invalid JSON in request body", 400);
    }

    var ConversationIdProvided = true;
    if (requestData.ConversationId === undefined) {
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
      console.error("Validation error:", error);
      return response.error(`Validation error: ${error.details[0].message}`, 400);
    }

    let completeMessageData;
    try {
      completeMessageData = messageSchemaWithConversationDetails.validate(Data).value;
    } catch (validationError) {
      console.error("Validation processing error:", validationError);
      return response.error("Invalid message data format", 400);
    }

    // Validate that host_id, property_id, and guest_id exist in database
    const validationResult = await validateIdsExist(
      completeMessageData.host_id,
      completeMessageData.property_id,
      completeMessageData.guest_id
    );
    
    if (!validationResult.valid) {
      return response.error(validationResult.error, 400);
    }

    // Connect to MongoDB
    let db;
    try {
      db = await connectToDatabase();
    } catch (dbError) {
      console.error("Database connection error:", dbError);
      return response.error("Database connection failed", 503);
    }

    if (!ConversationIdProvided) {
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
        console.error("Conversation validation error:", error);
        return response.error(`Conversation validation error: ${error.details[0].message}`, 400);
      }
      
      try {
        await db.collection("conversations").insertOne(newConversation);
      } catch (insertError) {
        console.error("Conversation creation error:", insertError);
        if (insertError.code === 11000) {
          return response.error("Conversation already exists", 409);
        }
        return response.error("Failed to create conversation", 500);
      }
    }

    const messageData = {
      _id: uuidv4(), // Generate a new unique ID for the message
      message: completeMessageData.message,
      sentBy: completeMessageData.sentBy,
      sentAt: completeMessageData.sentAt,
    };
    const { msgerror } = messageSchema.validate(messageData);
    if (msgerror) {
      console.error("Message validation error:", msgerror);
      return response.error(`Message validation error: ${msgerror.details[0].message}`, 400);
    }

    // add message
    try {
      const updateResult = await db
        .collection("conversations")
        .updateOne(
          { _id: completeMessageData.ConversationId },
          { $push: { messages: messageData } }
        );

      if (updateResult.matchedCount === 0) {
        return response.error("Conversation not found", 404);
      }

      if (updateResult.modifiedCount === 0) {
        return response.error("Failed to add message to conversation", 500);
      }
    } catch (updateError) {
      console.error("Message update error:", updateError);
      return response.error("Failed to send message", 500);
    }

    return response.success({
      message: "Message sent successfully",
      ConversationId: completeMessageData.ConversationId,
      messageData,
    });
  } catch (error) {
    console.error("Send message error:", error);
    return response.error("Internal server error", 500);
  }
};

module.exports = {
  handler,
};
