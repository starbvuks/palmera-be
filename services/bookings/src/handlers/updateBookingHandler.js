const { connectToDatabase } = require('../lib/mongodb');
const response = require('../lib/response');
const {
    updateBookingSchema
} = require('../lib/bookingsDAL.js');
const jwt = require('jsonwebtoken');

const handler = async (event) => {
    try {
        // Extract and verify JWT token
        const authHeader = event.headers.Authorization || event.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return response.error('Authorization header with Bearer token is required', 401);
        }

        const token = authHeader.substring(7);
        let decodedToken;
        try {
            decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        } catch (jwtError) {
            return response.error('Invalid or expired token', 401);
        }

        const bookingId = event.pathParameters['id'];

        // Parse request body
        let requestData;
        try {
            requestData = JSON.parse(event.body);
        } catch (parseError) {
            return response.error('Invalid JSON in request body', 400);
        }

        const updateData = {
            ...requestData,
            _id: bookingId,
            metadata: {
                updated_at: new Date(),
            }
        };

        // Validate input using partial update schema
        const { error, value } = updateBookingSchema.validate(updateData);
        if (error) {
            console.error('Validation error:', error);
            return response.error(`Validation error: ${error.details[0].message}`, 400);
        }

        // Connect to MongoDB
        const db = await connectToDatabase();

        // Check if booking exists
        const existingBooking = await db.collection('bookings').findOne({ _id: bookingId });
        if (!existingBooking) {
            return response.error('Booking not found', 404);
        }

        // Authorization: Check if user is either the host or guest of this booking
        const userId = decodedToken.userId;
        if (existingBooking.host_id !== userId && existingBooking.guest_id !== userId) {
            return response.error('Unauthorized: You can only update bookings you are associated with', 403);
        }

        // Prepare update object - only include fields that were provided
        const updateObject = {};
        
        // Only add fields that were actually provided in the request
        if (value.property_id !== undefined) updateObject.property_id = value.property_id;
        if (value.host_id !== undefined) updateObject.host_id = value.host_id;
        if (value.guest_id !== undefined) updateObject.guest_id = value.guest_id;
        
        // Handle nested objects - only update if provided
        if (value.bookingDetails) {
            updateObject.bookingDetails = { ...existingBooking.bookingDetails, ...value.bookingDetails };
        }
        
        if (value.pricing) {
            updateObject.pricing = { ...existingBooking.pricing, ...value.pricing };
        }
        
        if (value.payment) {
            updateObject.payment = { ...existingBooking.payment, ...value.payment };
        }
        
        if (value.cancellation) {
            updateObject.cancellation = { ...existingBooking.cancellation, ...value.cancellation };
        }
        
        // Always update metadata
        updateObject.metadata = { ...existingBooking.metadata, ...value.metadata };

        // Update booking
        const result = await db.collection('bookings').updateOne(
            { _id: bookingId }, 
            { $set: updateObject }
        );

        if (result.matchedCount === 0) {
            return response.error('Booking not found', 404);
        }

        return response.success({
            message: 'Booking updated successfully',
            updatedFields: Object.keys(updateObject)
        });
    } catch (error) {
        console.error('Update booking error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = {
    handler,
};