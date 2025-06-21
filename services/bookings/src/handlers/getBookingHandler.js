const { connectToDatabase } = require('../lib/mongodb');
const response = require('../lib/response');

const handler = async (event) => {


    try {
        const bookingId = event.pathParameters['id'];

        // Connect to MongoDB
        const db = await connectToDatabase();
        // Check if booking exists
        const booking = await db.collection('bookings').findOne({ _id: bookingId });
        if (!booking) {
            return response.error('booking not found', 404);
        }
        return response.success({ booking }, 200);
    } catch (error) {
        console.error('Get booking error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = {
    handler,
};