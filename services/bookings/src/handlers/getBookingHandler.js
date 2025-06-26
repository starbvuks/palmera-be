const { connectToDatabase } = require('../lib/mongodb');
const response = require('../lib/response');

const handler = async (event) => {
    try {
        // Validate path parameters
        if (!event.pathParameters || !event.pathParameters.id) {
            return response.error("Booking ID is required", 400);
        }

        const bookingId = event.pathParameters.id;

        // Validate booking ID format (basic validation)
        if (!bookingId || typeof bookingId !== 'string' || bookingId.trim() === '') {
            return response.error("Invalid booking ID format", 400);
        }

        // Connect to MongoDB
        let db;
        try {
            db = await connectToDatabase();
        } catch (dbError) {
            console.error("Database connection error:", dbError);
            return response.error("Database connection failed", 503);
        }

        // Check if booking exists
        let booking;
        try {
            booking = await db.collection('bookings').findOne({ _id: bookingId });
        } catch (queryError) {
            console.error("Database query error:", queryError);
            return response.error("Failed to retrieve booking", 500);
        }

        if (!booking) {
            return response.error('Booking not found', 404);
        }

        return response.success({ 
            booking,
            message: "Booking retrieved successfully"
        }, 200);
    } catch (error) {
        console.error('Get booking error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = {
    handler,
};