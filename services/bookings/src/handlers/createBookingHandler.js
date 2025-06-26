const { connectToDatabase } = require('../lib/mongodb');
const response = require('../lib/response');
const {
    bookingSchema
} = require('../lib/bookingsDAL.js');
const { v4: uuidv4 } = require('uuid');

const handler = async (event) => {
    try {
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

        const Data = {
            ...requestData,
            _id: uuidv4(), // Generate unique ID
            metadata: {
                created_at: new Date(),
                updated_at: new Date(),
            }
        };

        // Validate input
        const { error } = bookingSchema.validate(Data);
        if (error) {
            console.error("Validation error:", error);
            return response.error(`Validation error: ${error.details[0].message}`, 400);
        }

        let bookingData;
        try {
            bookingData = bookingSchema.validate(Data).value;
        } catch (validationError) {
            console.error("Validation processing error:", validationError);
            return response.error("Invalid booking data format", 400);
        }

        // Connect to MongoDB
        let db;
        try {
            db = await connectToDatabase();
        } catch (dbError) {
            console.error("Database connection error:", dbError);
            return response.error("Database connection failed", 503);
        }

        // Check if property exists
        let property;
        try {
            property = await db.collection('properties').findOne({ _id: bookingData.property_id });
        } catch (queryError) {
            console.error("Property query error:", queryError);
            return response.error("Failed to retrieve property information", 500);
        }

        if (!property) {
            return response.error('Property not found', 404);
        }

        // Check if host exists
        if (bookingData.host_id != property.host_id) {
            return response.error('Host ID does not match with property host ID', 400);
        }

        // Validate booking dates
        if (!bookingData.bookingDetails || !bookingData.bookingDetails.check_in || !bookingData.bookingDetails.check_out) {
            return response.error("Check-in and check-out dates are required", 400);
        }

        const startDate = new Date(bookingData.bookingDetails.check_in);
        const endDate = new Date(bookingData.bookingDetails.check_out);

        // Validate date format and logic
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return response.error("Invalid date format for check-in or check-out", 400);
        }

        if (startDate >= endDate) {
            return response.error("Check-out date must be after check-in date", 400);
        }

        // Get today's date (without time) for comparison
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (startDate < today) {
            return response.error("Check-in date cannot be in the past", 400);
        }

        // Check property availability
        if (!property.availability || !property.availability.availability_calendar) {
            return response.error("Property availability information is not available", 400);
        }

        // Convert availability dates to format that can be compared directly (YYYY-MM-DD)
        const availableDatesSet = new Set(property.availability.availability_calendar.map(date => {
            // Handle if dates are stored as strings or Date objects
            if (typeof date === 'string') {
                // If already in ISO format, get just the date part
                if (date.includes('T')) {
                    return date.split('T')[0];
                }
                return date;
            } else if (date instanceof Date) {
                return date.toISOString().split('T')[0];
            }
            return date;
        }));

        console.log('Available dates:', availableDatesSet);
        
        // Check each date in the requested booking period
        let unavailableDate = null;
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateString = d.toISOString().split('T')[0];
            console.log('Checking date:', dateString);
            
            if (!availableDatesSet.has(dateString)) {
                unavailableDate = dateString;
                console.log('Unavailable date found:', dateString);
                break;
            }
        }
        
        if (unavailableDate) {
            return response.error(`Property is not available for the selected date: ${unavailableDate}`, 409);
        }

        // Create booking
        try {
            await db.collection('bookings').insertOne(bookingData);
        } catch (insertError) {
            console.error("Booking creation error:", insertError);
            if (insertError.code === 11000) {
                return response.error("Booking already exists", 409);
            }
            return response.error("Failed to create booking", 500);
        }

        // Update property availability - remove booked dates
        try {
            const datesToRemove = [];
            for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                datesToRemove.push(d.toISOString().split('T')[0]);
            }
            
            const updateResult = await db.collection('properties').updateOne(
                { _id: bookingData.property_id },
                { $pull: { "availability.availability_calendar": { $in: datesToRemove } } }
            );

            if (updateResult.matchedCount === 0) {
                console.warn("Property not found during availability update");
            }
        } catch (updateError) {
            console.error("Property availability update error:", updateError);
            // Don't fail the booking creation, but log the error
        }

        return response.success({
            message: "Booking created successfully",
            bookingData
        });
    } catch (error) {
        console.error('Create booking error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = {
    handler,
};