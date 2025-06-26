const { connectToDatabase } = require('../lib/mongodb');
const response = require('../lib/response');

const handler = async(event) => {
    try {
        // Validate path parameters
        if (!event.pathParameters || !event.pathParameters.id) {
            return response.error("User ID is required", 400);
        }

        if (!event.pathParameters.locationId) {
            return response.error("Location ID is required", 400);
        }

        const userId = event.pathParameters.id;
        const locationId = event.pathParameters.locationId;

        // Validate user ID format (basic validation)
        if (!userId || typeof userId !== 'string' || userId.trim() === '') {
            return response.error("Invalid user ID format", 400);
        }

        // Validate location ID format (basic validation)
        if (!locationId || typeof locationId !== 'string' || locationId.trim() === '') {
            return response.error("Invalid location ID format", 400);
        }

        // Connect to MongoDB
        let db;
        try {
            db = await connectToDatabase();
        } catch (dbError) {
            console.error("Database connection error:", dbError);
            return response.error("Database connection failed", 503);
        }

        // Check if user exists and get current saved locations
        let user;
        try {
            user = await db.collection('users').findOne({ _id: userId }, { 
                projection: { 'savedItems.favoriteProperties': 1 } 
            });
        } catch (queryError) {
            console.error("Database query error:", queryError);
            return response.error("Failed to retrieve user saved locations", 500);
        }

        if (!user) {
            return response.error('User not found', 404);
        }

        const currentLocations = user.savedItems?.favoriteProperties || [];
        
        // Check if location exists in user's saved locations
        if (!currentLocations.includes(locationId)) {
            return response.error('Location not found in user saved locations', 404);
        }

        const updatedLocations = currentLocations.filter(id => id !== locationId);

        // Update Saved Items
        try {
            await db.collection('users').updateOne({ _id: userId }, {
                $set: {
                    "savedItems.favoriteProperties": updatedLocations
                }
            });
        } catch (updateError) {
            console.error("Delete location update error:", updateError);
            return response.error("Failed to delete saved location", 500);
        }

        return response.success({
            message: 'Deleted user saved location successfully',
            deletedLocationId: locationId,
            remainingCount: updatedLocations.length
        });
    } catch (error) {
        console.error('Delete user saved location error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = {
    handler,
};