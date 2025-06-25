const { connectToDatabase } = require('../lib/mongodb');
const response = require('../lib/response');
const Joi = require('joi');

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

        // Validate update data is an object
        if (!updateData || typeof updateData !== 'object' || Array.isArray(updateData)) {
            return response.error("Update data must be an object", 400);
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

        // Create a dynamic schema based on what fields are being updated
        const updateSchema = {};
        const uniqueFieldChecks = [];

        // Check for email uniqueness if being updated
        if (updateData.email) {
            updateSchema.email = Joi.string().email().required();
            uniqueFieldChecks.push(
                db.collection('users').findOne({ 
                    _id: { $ne: userId }, 
                    "personalInfo.email": updateData.email 
                })
            );
        }

        // Check for phone uniqueness if being updated
        if (updateData.phone) {
            updateSchema.phone = Joi.string().required();
            uniqueFieldChecks.push(
                db.collection('users').findOne({ 
                    _id: { $ne: userId }, 
                    "personalInfo.phone": updateData.phone 
                })
            );
        }

        // Add other fields to the schema
        Object.keys(updateData).forEach(key => {
            if (!updateSchema[key] && key !== 'email' && key !== 'phone') {
                updateSchema[key] = Joi.any();
            }
        });

        // Validate input
        const schema = Joi.object(updateSchema);
        const { error } = schema.validate(updateData);
        if (error) {
            console.error("Validation error:", error);
            return response.error(`Validation error: ${error.details[0].message}`, 400);
        }

        // Check if email or phone is already in use by another user
        if (uniqueFieldChecks.length > 0) {
            try {
                const results = await Promise.all(uniqueFieldChecks);
                const duplicateFound = results.some(result => result !== null);
                
                if (duplicateFound) {
                    return response.error('Email or phone number is already in use', 409);
                }
            } catch (checkError) {
                console.error("Duplicate check error:", checkError);
                return response.error("Failed to validate unique fields", 500);
            }
        }

        // Prepare update object - only include fields that were provided
        const updateObject = {};
        Object.keys(updateData).forEach(key => {
            updateObject[`personalInfo.${key}`] = updateData[key];
        });

        // Add updated timestamp
        updateObject["accountStatus.updatedAt"] = new Date();

        // Update user
        try {
            await db.collection('users').updateOne(
                { _id: userId }, 
                { $set: updateObject }
            );
        } catch (updateError) {
            console.error("User update error:", updateError);
            return response.error("Failed to update user", 500);
        }

        return response.success({ 
            message: 'User updated successfully', 
            user: updateObject 
        });
    } catch (error) {
        console.error('Update user error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = {
    handler,
};