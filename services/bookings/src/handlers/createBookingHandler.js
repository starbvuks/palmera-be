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

        // check if availability exists
        const startDate = new Date(bookingData.bookingDetails.check_in);
        const endDate = new Date(bookingData.bookingDetails.check_out);
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            console.log(d);
            if (!property.availability.availability_calendar.includes(d.toISOString().split("T")[0])) {
                return response.error('Property is not available for the selected dates', 400);
            }
        }


        // Create booking
        await db.collection('bookings').insertOne(bookingData);

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