const { connectToDatabase } = require('../lib/mongodb');
const response = require('../lib/response');

const handler = async (event) => {


    try {
        const hostId = event.pathParameters['id'];

        // Connect to MongoDB
        const db = await connectToDatabase();
        // Check if booking exists
        const bookings = await db.collection('bookings').find({ host_id: hostId, "bookingDetails.status": { "$nin": ['completed', "pending"] } }).toArray();
        if (!bookings.length) {
            return response.error('No past booking found with this hostId', 404);
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