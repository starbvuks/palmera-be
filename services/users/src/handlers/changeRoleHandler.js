const { connectToDatabase } = require('../lib/mongodb');
const response = require('../lib/response');

const handler = async (event) => {
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

        // Validate query parameters
        if (!event.queryStringParameters || !event.queryStringParameters.role) {
            return response.error("Role parameter is required", 400);
        }

        const role = event.queryStringParameters.role;

        // Validate role value
        if (!['host', 'guest'].includes(role)) {
            return response.error("Role must be either 'host' or 'guest'", 400);
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

        // Check host verification if changing to host role
        if (role === "host") {
            if (!user.hostDetails || !user.hostDetails.verification || !user.hostDetails.verification.status || user.hostDetails.verification.status !== 'verified') {
                return response.error('Host verification pending. Please complete host verification before changing to host role.', 400);
            }
        }

        const query = role === "host" ? {
            "roles.isHost": true
        } : {
            "roles.isHost": false
        };

        // Update user role
        try {
            await db.collection('users').updateOne({ _id: userId }, {
                $set: query
            });
        } catch (updateError) {
            console.error("Role update error:", updateError);
            return response.error("Failed to update user role", 500);
        }

        return response.success({ 
            message: `User role updated to ${role} successfully`,
            newRole: role
        });
    } catch (error) {
        console.error('Update user role error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = {
    handler,
};