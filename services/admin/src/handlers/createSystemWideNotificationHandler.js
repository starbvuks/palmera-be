const { connectToDatabase } = require('../lib/mongodb');
const response = require('../lib/response');
const {
    notificationSchema,
} = require('../lib/notificationDAL.js');
const { v4: uuidv4 } = require('uuid');

const handler = async (event) => {
    try {
        const requestData = JSON.parse(event.body);
        const Data = {
            ...requestData,
            _id: uuidv4(),
            isSystemNotification: true
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
        console.error('Create system wide notification error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = {
    handler,
};