const { connectToDatabase } = require('../lib/mongodb');
const response = require('../lib/response');
const Joi = require('joi');

const searchSchema = Joi.object({
    location: Joi.string(),
    min_price: Joi.number().min(0),
    max_price: Joi.number().min(0),
    availability_start: Joi.date(),
    availability_end: Joi.date(),
    amenities: Joi.array().items(Joi.string()),
    property_type: Joi.string().valid("Entire place", "Private room", "Shared room"),
    status: Joi.string().valid("active", "pending", "inactive"),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
});

const handler = async (event) => {
    try {
        // Check admin authorization
        if (!event.requestContext || !event.requestContext.authorizer || !event.requestContext.authorizer.principalId) {
            return response.error('Authentication required', 401);
        }

        const adminUserId = event.requestContext.authorizer.principalId;

        // Parse and validate query parameters
        let requestFilters = event.queryStringParameters || {};

        // Convert string values to appropriate types
        if (requestFilters.min_price) requestFilters.min_price = parseFloat(requestFilters.min_price);
        if (requestFilters.max_price) requestFilters.max_price = parseFloat(requestFilters.max_price);
        if (requestFilters.availability_start) requestFilters.availability_start = new Date(requestFilters.availability_start);
        if (requestFilters.availability_end) requestFilters.availability_end = new Date(requestFilters.availability_end);
        if (requestFilters.page) requestFilters.page = parseInt(requestFilters.page);
        if (requestFilters.limit) requestFilters.limit = parseInt(requestFilters.limit);

        // Convert amenities string to an array
        if (requestFilters.amenities && typeof requestFilters.amenities === "string") {
            requestFilters.amenities = requestFilters.amenities.split(",").map(item => item.trim());
        }

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
        const adminUser = await db.collection('users').findOne({ _id: adminUserId });
        if (!adminUser) {
            return response.error('Admin user not found', 404);
        }

        if (!adminUser.roles || !adminUser.roles.isAdmin) {
            return response.error('Admin access required', 403);
        }

        // Build query filters
        let query = {};

        if (filters.location) {
            query['location.address'] = { $regex: filters.location, $options: 'i' };
        }
        
        if (filters.min_price || filters.max_price) {
            query['pricing.price_per_night'] = {};
            if (filters.min_price) {
                query['pricing.price_per_night']['$gte'] = filters.min_price;
            }
            if (filters.max_price) {
                query['pricing.price_per_night']['$lte'] = filters.max_price;
            }
        }
        
        if (filters.amenities && filters.amenities.length > 0) {
            filters.amenities.forEach((amenity) => {
                query[`amenities.${amenity}`] = true;
            });
        }
        
        if (filters.property_type) {
            query['basicInfo.property_type'] = filters.property_type;
        }
        
        if (filters.status) {
            query['basicInfo.status'] = filters.status;
        }

        // Availability filter: Check if all dates between availability_start and availability_end exist in availability_calendar
        if (filters.availability_start && filters.availability_end) {
            if (filters.availability_start > filters.availability_end) {
                return response.error('Availability start date must be before end date', 400);
            }

            const startDate = new Date(filters.availability_start);
            const endDate = new Date(filters.availability_end);

            let dateArray = [];
            for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                dateArray.push(new Date(d).toISOString().split("T")[0]); // Format as YYYY-MM-DD
            }

            query["availability.availability_calendar"] = { $all: dateArray };
        }

        // Calculate pagination
        const skip = (filters.page - 1) * filters.limit;

        try {
            // Get total count for pagination
            const totalCount = await db.collection('properties').countDocuments(query);

            // Fetch properties with pagination
            const properties = await db.collection('properties')
                .find(query)
                .skip(skip)
                .limit(filters.limit)
                .sort({ createdAt: -1 })
                .toArray();

            return response.success({
                properties,
                pagination: {
                    page: filters.page,
                    limit: filters.limit,
                    total: totalCount,
                    pages: Math.ceil(totalCount / filters.limit)
                }
            });
        } catch (queryError) {
            console.error('Database query error:', queryError);
            return response.error('Failed to fetch properties', 500);
        }
    } catch (error) {
        console.error('Get properties for moderation error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = {
    handler,
};