const { connectToDatabase } = require('../../../auth/src/lib/mongodb.js');
const response = require('../../../auth/src/lib/response.js');
const {
    notificationSchema,
} = require('../lib/notificationDAL.js');
const { v4: uuidv4 } = require('uuid');

const handler = async (event) => {
    try {
        const requestData = JSON.parse(event.body);
        const Data = {
            ...requestData,
            _id: uuidv4()
        };

        // Validate input
        const { error } = notificationSchema.validate(Data);
        if (error) {
            console.error(error);
            return response.error(error.details[0].message, 400);
        }


        NotificationData = notificationSchema.validate(Data).value;
        // Connect to MongoDB
        const db = await connectToDatabase();
        await db.collection('notifications').insertOne(NotificationData);
        
        
        return response.success({
            NotificationData
        });
    } catch (error) {
        console.error('Create notification error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = {
    handler,
};