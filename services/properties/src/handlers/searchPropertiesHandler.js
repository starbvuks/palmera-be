const { connectToDatabase } = require('../lib/mongodb');
const response = require('../lib/response');
const Joi = require('joi');

const searchSchema = Joi.object({
    location: Joi.string(),
    min_price: Joi.number(),
    max_price: Joi.number(),
    availability_start: Joi.date(),
    availability_end: Joi.date(),
    amenities: Joi.array().items(Joi.string()),
    property_type: Joi.string().valid("Entire place", "Private room", "Shared room"),
    status: Joi.string().valid("active", "pending", "inactive"),
});

const handler = async (event) => {
    try {
        let requestFilters = event.queryStringParameters || {};

        // Convert amenities string to an array
        if (requestFilters.amenities && typeof requestFilters.amenities === "string") {
            requestFilters.amenities = requestFilters.amenities.split(",");
        }

        // Validate input
        const { error } = searchSchema.validate(requestFilters);
        if (error) {
            console.error("Validation error:", error);
            return response.error(`Validation error: ${error.details[0].message}`, 400);
        }

        let filters;
        try {
            filters = searchSchema.validate(requestFilters).value;
        } catch (validationError) {
            console.error("Validation processing error:", validationError);
            return response.error("Invalid search parameters format", 400);
        }

        let query = {};

        if (filters.location) query['location.address'] = { $regex: filters.location, $options: 'i' };
        if (filters.min_price) query['pricing.price_per_night'] = { $gte: filters.min_price };
        if (filters.max_price) query['pricing.price_per_night'] = { ...query['pricing.price_per_night'], $lte: filters.max_price };
        if (filters.amenities) {
            filters.amenities.forEach((amenity) => {
                query[`amenities.${amenity}`] = true;
            })
        };
        if (filters.property_type) query['basicInfo.property_type'] = filters.property_type;
        if (filters.status) query['basicInfo.status'] = filters.status;
        
        // Availability filter: Check if all dates between availability_start and availability_end exist in availability_calendar
        if (filters.availability_start && filters.availability_end) {
            const startDate = new Date(filters.availability_start);
            const endDate = new Date(filters.availability_end);

            // Validate date range
            if (startDate >= endDate) {
                return response.error("Availability start date must be before end date", 400);
            }

            let dateArray = [];
            for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                dateArray.push(new Date(d).toISOString().split("T")[0]); // Format as YYYY-MM-DD
            }

            query["availability.availability_calendar"] = { $all: dateArray };
        }

        // Connect to MongoDB
        let db;
        try {
            db = await connectToDatabase();
        } catch (dbError) {
            console.error("Database connection error:", dbError);
            return response.error("Database connection failed", 503);
        }

        // Fetch properties from database
        let properties;
        try {
            properties = await db.collection('properties').find(query).toArray();
        } catch (queryError) {
            console.error("Database query error:", queryError);
            return response.error("Failed to search properties", 500);
        }

        return response.success({ 
            properties, 
            count: properties.length,
            message: `Found ${properties.length} properties matching your criteria`
        }, 200);
    } catch (error) {
        console.error('Search properties error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = {
    handler,
};