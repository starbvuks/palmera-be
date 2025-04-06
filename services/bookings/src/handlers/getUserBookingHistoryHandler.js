const { connectToDatabase } = require('../../../auth/src/lib/mongodb');
const response = require('../../../auth/src/lib/response');

const handler = async (event) => {


    try {
        const userId = event.pathParameters['id'];

        // Connect to MongoDB
        const db = await connectToDatabase();
        // Check if booking exists
        const bookings = await db.collection('bookings').find({ guest_id: userId, "bookingDetails.status": { "$nin": ['completed', "pending"] } }).toArray();
        if (!bookings.length) {
            return response.error('No past booking found with this userId', 404);
        }
        return response.success({ bookings }, 200);
    } catch (error) {
        console.error('Get booking error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = {
    handler,
};