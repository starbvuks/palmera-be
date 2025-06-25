const { connectToDatabase } = require('../lib/mongodb');
const response = require('../lib/response');
const {
    userSchema
} = require('../lib/userDAL.js');

const handler = async (event) => {
    try {
        // Check admin authorization
        if (!event.requestContext || !event.requestContext.authorizer || !event.requestContext.authorizer.principalId) {
            return response.error('Authentication required', 401);
        }

        const adminUserId = event.requestContext.authorizer.principalId;
        const userId = event.pathParameters['id'];

        // Parse request body
        let updateData;
        try {
            updateData = JSON.parse(event.body);
        } catch (parseError) {
            return response.error('Invalid JSON in request body', 400);
        }

        // Validate input
        const { error } = userSchema.validate(updateData);
        if (error) {
            return response.error(`Validation error: ${error.details[0].message}`, 400);
        }

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

        // Check if target user exists
        const targetUser = await db.collection('users').findOne({ _id: userId });
        if (!targetUser) {
            return response.error('User not found', 404);
        }

        // Prevent admin from modifying their own admin status
        if (userId === adminUserId && updateData.roles && updateData.roles.isAdmin === false) {
            return response.error('Cannot modify your own admin status', 403);
        }

        // Update user
        try {
            const result = await db.collection('users').updateOne(
                { _id: userId },
                {
                    $set: {
                        ...updateData,
                        "accountStatus.updatedAt": new Date(),
                        "accountStatus.updatedBy": adminUserId
                    }
                }
            );

            if (result.matchedCount === 0) {
                return response.error('User not found', 404);
            }

            if (result.modifiedCount === 0) {
                return response.success({ 
                    message: 'User updated successfully (no changes made)',
                    userId: userId
                });
            }

            return response.success({ 
                message: 'User updated by admin successfully',
                userId: userId,
                modifiedCount: result.modifiedCount
            });
        } catch (updateError) {
            console.error('User update error:', updateError);
            return response.error('Failed to update user', 500);
        }
    } catch (error) {
        console.error('Update user by admin error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = {
    handler,
};