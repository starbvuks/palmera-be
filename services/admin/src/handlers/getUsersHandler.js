const { connectToDatabase } = require('../lib/mongodb');
const response = require('../lib/response');
const Joi = require('joi');

// Schema for validating query parameters
const searchSchema = Joi.object({
    role: Joi.string().valid('admin', 'host', 'guest', 'superhost'),
    status: Joi.string().valid('active', 'suspended', 'deleted'),
    registered_from: Joi.date(),
    registered_to: Joi.date(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
});

const handler = async (event) => {
    try {
        // Check admin authorization
        if (!event.requestContext || !event.requestContext.authorizer || !event.requestContext.authorizer.principalId) {
            return response.error('Authentication required', 401);
        }

        const userId = event.requestContext.authorizer.principalId;

        // Parse and validate query parameters
        let requestFilters = event.queryStringParameters || {};
        
        // Convert string values to appropriate types
        if (requestFilters.page) requestFilters.page = parseInt(requestFilters.page);
        if (requestFilters.limit) requestFilters.limit = parseInt(requestFilters.limit);
        if (requestFilters.registered_from) requestFilters.registered_from = new Date(requestFilters.registered_from);
        if (requestFilters.registered_to) requestFilters.registered_to = new Date(requestFilters.registered_to);

        // Validate input
        const { error } = searchSchema.validate(requestFilters);
        if (error) {
            return response.error(`Validation error: ${error.details[0].message}`, 400);
        }

        const filters = searchSchema.validate(requestFilters).value;

        // Connect to database
        let db;
        try {
            db = await connectToDatabase();
        } catch (dbError) {
            console.error('Database connection error:', dbError);
            return response.error('Database connection failed', 503);
        }

        // Verify admin permissions
        const adminUser = await db.collection('users').findOne({ _id: userId });
        if (!adminUser) {
            return response.error('User not found', 404);
        }

        if (!adminUser.roles || !adminUser.roles.isAdmin) {
            return response.error('Admin access required', 403);
        }

        // Build query filters
        let query = {};
        
        if (filters.role) {
            if (filters.role === 'host') {
                query["roles.isHost"] = true;
            } else if (filters.role === 'superhost') {
                query["roles.isSuperhost"] = true;
            } else if (filters.role === 'admin') {
                query["roles.isAdmin"] = true;
            } else if (filters.role === 'guest') {
                query["roles.isHost"] = false;
            }
        }
        
        if (filters.status) {
            query["accountStatus.status"] = filters.status;
        }
        
        if (filters.registered_from || filters.registered_to) {
            query["createdAt"] = {};
            if (filters.registered_from) {
                query["createdAt"]["$gte"] = filters.registered_from;
            }
            if (filters.registered_to) {
                query["createdAt"]["$lte"] = filters.registered_to;
            }
        }

        // Calculate pagination
        const skip = (filters.page - 1) * filters.limit;
        
        try {
            // Get total count for pagination
            const totalCount = await db.collection('users').countDocuments(query);
            
            // Fetch users with pagination
            const users = await db.collection('users')
                .find(query)
                .skip(skip)
                .limit(filters.limit)
                .sort({ createdAt: -1 })
                .toArray();

            // Remove sensitive data from response
            const sanitizedUsers = users.map(user => {
                const { authentication, ...sanitizedUser } = user;
                return sanitizedUser;
            });

            return response.success({
                users: sanitizedUsers,
                pagination: {
                    page: filters.page,
                    limit: filters.limit,
                    total: totalCount,
                    pages: Math.ceil(totalCount / filters.limit)
                }
            });
        } catch (queryError) {
            console.error('Database query error:', queryError);
            return response.error('Failed to fetch users', 500);
        }
    } catch (error) {
        console.error('Get users error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = {
    handler,
};