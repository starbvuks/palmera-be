const { connectToDatabase } = require('../lib/mongodb');
const response = require('../lib/response');

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

        // Get user bookings
        let bookings;
        try {
            bookings = await db.collection('bookings').find({ guest_id: userId }).toArray();
        } catch (queryError) {
            console.error("Database query error:", queryError);
            return response.error("Failed to retrieve bookings", 500);
        }

        if (!bookings || bookings.length === 0) {
            return response.error('No bookings found for this user', 404);
        }

        return response.success({ 
            bookings,
            count: bookings.length,
            message: "User bookings retrieved successfully"
        }, 200);
    } catch (error) {
        console.error('Get user bookings error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = {
    handler,
};