const { connectToDatabase } = require('../../../auth/src/lib/mongodb');
const response = require('../../../auth/src/lib/response');

const handler = async (event) => {


    try {
        const notificationId = event.pathParameters['id'];        

        // Connect to MongoDB
        const db = await connectToDatabase();
        
        await db.collection('notifications').deleteOne({ _id: notificationId } );
        return response.success({ "response":"Notification Deleted Succsessfully" }, 200);
    } catch (error) {
        console.error('Get notification error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = {
    handler,
};