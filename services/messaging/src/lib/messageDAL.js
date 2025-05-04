const Joi = require('joi');

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

// Exporting Modules
module.exports = {conversationSchema,messageSchemaWithConversationDetails,messageSchema};