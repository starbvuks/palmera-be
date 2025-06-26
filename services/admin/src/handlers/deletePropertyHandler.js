const { connectToDatabase } = require('../lib/mongodb');
const response = require('../lib/response');

const handler = async (event) => {
    try {
        // Check admin authorization
        if (!event.requestContext || !event.requestContext.authorizer || !event.requestContext.authorizer.principalId) {
            return response.error('Authentication required', 401);
        }

        const adminUserId = event.requestContext.authorizer.principalId;
        const propertyId = event.pathParameters['id'];

        // Connect to database
        let db;
        try {
            db = await connectToDatabase();
        } catch (dbError) {
            console.error('Database connection error:', dbError);
            return response.error('Database connection failed', 503);
        }

        // Verify admin permissions
        const adminUser = await db.collection('users').findOne({ _id: adminUserId });
        if (!adminUser) {
            return response.error('Admin user not found', 404);
        }

        if (!adminUser.roles || !adminUser.roles.isAdmin) {
            return response.error('Admin access required', 403);
        }

        // Check if property exists
        const existingProperty = await db.collection('properties').findOne({ _id: propertyId });
        if (!existingProperty) {
            return response.error('Property not found', 404);
        }

        // Check if property has active bookings
        const activeBookings = await db.collection('bookings').findOne({
            propertyId: propertyId,
            status: { $in: ['confirmed', 'active'] }
        });

        if (activeBookings) {
            return response.error('Cannot delete property with active bookings', 409);
        }

        // Delete property
        try {
            const result = await db.collection('properties').deleteOne({ _id: propertyId });

            if (result.deletedCount === 0) {
                return response.error('Property not found', 404);
            }

            // Also delete related data (optional - depending on your requirements)
            try {
                await db.collection('bookings').deleteMany({ propertyId: propertyId });
                await db.collection('wishlist').deleteMany({ propertyId: propertyId });
            } catch (relatedDataError) {
                console.error('Error deleting related data:', relatedDataError);
                // Don't fail the main operation for related data cleanup errors
            }

            return response.success({
                message: 'Property deleted by admin successfully',
                propertyId: propertyId,
                deletedCount: result.deletedCount
            });
        } catch (deleteError) {
            console.error('Property deletion error:', deleteError);
            return response.error('Failed to delete property', 500);
        }
    } catch (error) {
        console.error('Delete property by admin error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = {
    handler,
};