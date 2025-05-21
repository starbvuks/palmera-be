const { connectToDatabase } = require('../lib/mongodb');
const response = require('../lib/response');
const {
    cancellationSchema
} = require('../lib/bookingsDAL.js');

const handler = async (event) => {
    try {
        bookingId = event.pathParameters['id'];

        const requestData = JSON.parse(event.body);

        // Validate input
        const { error } = cancellationSchema.validate(requestData);
        if (error) {
            console.error(error);
            return response.error(error.details[0].message, 400);
        }

        data = cancellationSchema.validate(requestData).value;

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
        const db = await connectToDatabase();

        // update booking
        await db.collection('bookings').updateOne({ _id: bookingId }, { $set: cancellationData });

        return response.success({
            message: 'booking cancled successfully'
        });
    } catch (error) {
        console.error('cancel booking error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = {
    handler,
};