const { connectToDatabase } = require('../lib/mongodb');
const response = require('../lib/response');
const {
    cancellationSchema
} = require('../lib/bookingsDAL.js');

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

        // Validate input
        const { error } = cancellationSchema.validate(requestData);
        if (error) {
            console.error("Validation error:", error);
            return response.error(`Validation error: ${error.details[0].message}`, 400);
        }

        let data;
        try {
            data = cancellationSchema.validate(requestData).value;
        } catch (validationError) {
            console.error("Validation processing error:", validationError);
            return response.error("Invalid cancellation data format", 400);
        }

        const cancellationData = {
            ...data,
            bookingDetails: {
                status: 'cancelled',
            },
            metadata: {
                updated_at: new Date(),
            }
        };

        // Connect to MongoDB
        let db;
        try {
            db = await connectToDatabase();
        } catch (dbError) {
            console.error("Database connection error:", dbError);
            return response.error("Database connection failed", 503);
        }

        // Check if booking exists before updating
        let existingBooking;
        try {
            existingBooking = await db.collection('bookings').findOne({ _id: bookingId });
        } catch (queryError) {
            console.error("Database query error:", queryError);
            return response.error("Failed to retrieve booking", 500);
        }

        if (!existingBooking) {
            return response.error('Booking not found', 404);
        }

        // Check if booking is already cancelled
        if (existingBooking.bookingDetails && existingBooking.bookingDetails.status === 'cancelled') {
            return response.error('Booking is already cancelled', 409);
        }

        // Update booking
        try {
            const updateResult = await db.collection('bookings').updateOne(
                { _id: bookingId }, 
                { $set: cancellationData }
            );

            if (updateResult.matchedCount === 0) {
                return response.error("Booking not found during update", 404);
            }

            if (updateResult.modifiedCount === 0) {
                return response.error("Failed to cancel booking", 500);
            }
        } catch (updateError) {
            console.error("Booking cancellation error:", updateError);
            return response.error("Failed to cancel booking", 500);
        }

        return response.success({
            message: 'Booking cancelled successfully',
            bookingId
        });
    } catch (error) {
        console.error('Cancel booking error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = {
    handler,
};