const { connectToDatabase } = require('../lib/mongodb.js');
const response = require('../lib/response.js');
const { subscriptionsSchema } = require('../lib/userDAL.js');

const handler = async(event) => {
    try {
        // Validate path parameters
        if (!event.pathParameters || !event.pathParameters.id) {
            return response.error("User ID is required", 400);
        }

        const userId = event.pathParameters.id;

        // Validate user ID format (basic validation)
        if (!userId || typeof userId !== 'string' || userId.trim() === '') {
            return response.error("Invalid user ID format", 400);
        }

        // Validate request body
        if (!event.body) {
            return response.error("Request body is required", 400);
        }

        let updateData;
        try {
            updateData = JSON.parse(event.body);
        } catch (parseError) {
            console.error("JSON parse error:", parseError);
            return response.error("Invalid JSON in request body", 400);
        }

        // Validate input
        const { error } = subscriptionsSchema.validate(updateData);
        if (error) {
            console.error("Validation error:", error);
            return response.error(`Validation error: ${error.details[0].message}`, 400);
        }

        // Connect to MongoDB
        let db;
        try {
            db = await connectToDatabase();
        } catch (dbError) {
            console.error("Database connection error:", dbError);
            return response.error("Database connection failed", 503);
        }

        // Check if user exists
        let user;
        try {
            user = await db.collection('users').findOne({ _id: userId });
        } catch (queryError) {
            console.error("Database query error:", queryError);
            return response.error("Failed to retrieve user", 500);
        }

        if (!user) {
            return response.error('User not found', 404);
        }

        // Update user subscription
        try {
            await db.collection('users').updateOne({ _id: userId }, {
                $set: { subscription: updateData }
            });
        } catch (updateError) {
            console.error("Subscription update error:", updateError);
            return response.error("Failed to update user subscription", 500);
        }

        // Fetch updated subscription
        let updatedUser;
        try {
            updatedUser = await db.collection('users').findOne({ _id: userId }, { projection: { subscription: 1 } });
        } catch (fetchError) {
            console.error("Fetch updated subscription error:", fetchError);
            return response.error("Failed to retrieve updated subscription", 500);
        }

        return response.success({
            ...updatedUser,
            message: "User subscription updated successfully"
        });
    } catch (error) {
        console.error('Update user subscription error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = { handler };