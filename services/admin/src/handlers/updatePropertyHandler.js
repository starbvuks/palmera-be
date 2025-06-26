const { connectToDatabase } = require('../lib/mongodb');
const response = require('../lib/response');
const {
    propertySchema
} = require('../lib/propertiesDAL.js');

const handler = async (event) => {
    try {
        // Check admin authorization
        if (!event.requestContext || !event.requestContext.authorizer || !event.requestContext.authorizer.principalId) {
            return response.error('Authentication required', 401);
        }

        const adminUserId = event.requestContext.authorizer.principalId;
        const propertyId = event.pathParameters['id'];

        // Parse request body
        let requestData;
        try {
            requestData = JSON.parse(event.body);
        } catch (parseError) {
            return response.error('Invalid JSON in request body', 400);
        }

        // Validate input
        const Data = {
            ...requestData,
            _id: propertyId,
            metadata: {
                updated_at: new Date(),
                updated_by: adminUserId
            }
        };

        const { error } = propertySchema.validate(Data);
        if (error) {
            return response.error(`Validation error: ${error.details[0].message}`, 400);
        }

        const propertyData = propertySchema.validate(Data).value;

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

        // Update property
        try {
            const result = await db.collection('properties').updateOne(
                { _id: propertyData._id },
                { $set: Data }
            );

            if (result.matchedCount === 0) {
                return response.error('Property not found', 404);
            }

            if (result.modifiedCount === 0) {
                return response.success({
                    message: 'Property updated successfully (no changes made)',
                    propertyId: propertyId
                });
            }

            return response.success({
                message: 'Property updated by admin successfully',
                propertyId: propertyId,
                modifiedCount: result.modifiedCount
            });
        } catch (updateError) {
            console.error('Property update error:', updateError);
            return response.error('Failed to update property', 500);
        }
    } catch (error) {
        console.error('Update property by admin error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = {
    handler,
};