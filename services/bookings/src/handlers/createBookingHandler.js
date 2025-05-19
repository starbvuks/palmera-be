const { connectToDatabase } = require('../../../auth/src/lib/mongodb');
const response = require('../../../auth/src/lib/response');
const {
    bookingSchema
} = require('../lib/bookingsDAL.js');
const { v4: uuidv4 } = require('uuid');

const handler = async (event) => {
    try {
        const requestData = JSON.parse(event.body);
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
            console.error(error);
            return response.error(error.details[0].message, 400);
        }


        bookingData = bookingSchema.validate(Data).value;
        // Connect to MongoDB
        const db = await connectToDatabase();

        // Check if property exists
        const property = await db.collection('properties').findOne({ _id: bookingData.property_id });
        if (!property) {
            return response.error('Property not found', 404);
        }
        // Check if host exists
        if (bookingData.host_id != property.host_id) {
            return response.error('Host ID does not match with property host ID', 400);
        }

        // Fix: properly check if all dates in the range are available
        const startDate = new Date(bookingData.bookingDetails.check_in);
        const endDate = new Date(bookingData.bookingDetails.check_out);
        
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
            return response.error(`Property is not available for the selected date: ${unavailableDate}`, 400);
        }

        // Create booking
        await db.collection('bookings').insertOne(bookingData);

        // Update property availability - remove booked dates
        const datesToRemove = [];
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            datesToRemove.push(d.toISOString().split('T')[0]);
        }
        
        await db.collection('properties').updateOne(
            { _id: bookingData.property_id },
            { $pull: { "availability.availability_calendar": { $in: datesToRemove } } }
        );

        return response.success({
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