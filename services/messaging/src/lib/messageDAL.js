const Joi = require('joi');
const { connectToDatabase } = require('./mongodb.js');

// Final Booking Schema
const messageSchema = Joi.object({
    _id: Joi.string().required(),
    message: Joi.string().required(),
    sentBy: Joi.string().valid('host', 'guest').required(),
    sentAt: Joi.date().default(new Date())
});

const conversationSchema = Joi.object({
    _id: Joi.string().required(),
    property_id: Joi.string().required(),
    host_id: Joi.string().required(),
    guest_id: Joi.string().required(),
    messages: Joi.array().items(messageSchema).default([]),
    createdAt: Joi.date().default(new Date())
});

const messageSchemaWithConversationDetails = messageSchema.append({
    ConversationId: Joi.string().required(),
    property_id: Joi.string().required(),
    host_id: Joi.string().required(),
    guest_id: Joi.string().required(),
    message: Joi.string().required(),
    sentBy: Joi.string().valid('host', 'guest').required(),
    sentAt: Joi.date().default(new Date())

});

// Validation functions to check if IDs exist in database
const validateIdsExist = async (host_id, property_id, guest_id) => {
    try {
        const db = await connectToDatabase();
        
        // Check if host exists
        const host = await db.collection('users').findOne({ _id: host_id });
        if (!host) {
            return { valid: false, error: `Host with ID ${host_id} does not exist` };
        }

        // Check if guest exists
        const guest = await db.collection('users').findOne({ _id: guest_id });
        if (!guest) {
            return { valid: false, error: `Guest with ID ${guest_id} does not exist` };
        }

        // Check if property exists
        const property = await db.collection('properties').findOne({ _id: property_id });
        if (!property) {
            return { valid: false, error: `Property with ID ${property_id} does not exist` };
        }

        // Verify that the host_id matches the property's host
        if (property.host_id !== host_id) {
            return { valid: false, error: `Host ID ${host_id} does not match the property's host ID ${property.host_id}` };
        }

        return { valid: true };
    } catch (error) {
        console.error('Database validation error:', error);
        return { valid: false, error: 'Database validation failed' };
    }
};

// Exporting Modules
module.exports = {
    conversationSchema,
    messageSchemaWithConversationDetails,
    messageSchema,
    validateIdsExist
};