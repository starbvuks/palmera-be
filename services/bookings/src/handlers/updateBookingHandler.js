const { connectToDatabase } = require('../../../auth/src/lib/mongodb');
const response = require('../../../auth/src/lib/response');
const {
    bookingSchema
} = require('../lib/bookingsDAL.js');

const handler = async (event) => {
    try {
        bookingId = event.pathParameters['id'];

        const requestData = JSON.parse(event.body);
        const Data = {
            ...requestData,
            _id: bookingId,
            metadata: {
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

        // update booking
        await db.collection('bookings').updateOne({ _id: bookingData._id }, { $set: Data });

        return response.success({
            message: 'booking updated successfully'
        });
    } catch (error) {
        console.error('update booking error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = {
    handler,
};