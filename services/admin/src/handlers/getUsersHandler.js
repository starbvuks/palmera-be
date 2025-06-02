const { connectToDatabase } = require('../lib/mongodb');
const response = require('../lib/response');
const Joi = require('joi');

// Schema for validating query parameters
const searchSchema = Joi.object({
    role: Joi.string().valid('admin', 'host', 'guest','superhost'),
    status: Joi.string().valid('active', 'suspended', 'deleted'),
    registered_from: Joi.date(),
    registered_to: Joi.date(),
});

const handler = async (event) => {
    try {
        let requestFilters = event.queryStringParameters || {};
        // Validate input
        const { error } = searchSchema.validate(requestFilters);
        if (error) {
            return response.error(error.details[0].message, 400);
        }

        filters = searchSchema.validate(requestFilters).value;
        let query = {};
        if (filters.role) {
            if (filters.role === 'host') {
                query["roles.isHost"] = true;  
            }
            if (filters.role === 'superhost') {
                query["roles.isSuperhost"] = true;  
            }
            if (filters.role === 'admin') {
                query["roles.isAdmin"] = true;  
            }
            if (filters.role === 'guest') {
                query["roles.isHost"] = false;  
            }
        }
        if (filters.status) query["accountStatus.status"] = filters.status;
        if (filters.registered_from || filters.registered_to) {
            query["accountStatus.createdAt"] = {};
            if (filters.registered_from) query["accountStatus.createdAt"]["$gte"] =new Date(filters.registered_from);
            if (filters.registered_to) query["accountStatus.createdAt"]["$lte"]= new Date(filters.registered_to)};
        
        // Connect to MongoDB
        const db = await connectToDatabase();
        // Check if property exists
        console.log('filters:', query);
        const users = await db.collection('users').find(query).toArray();

        return response.success({ users, count: users.length }, 200);
    } catch (error) {
        console.error('Get users error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = {
    handler,
};