const { connectToDatabase } = require('../lib/mongodb');
const response = require('../lib/response');
const Joi = require('joi');

const handler = async (event) => {
    try {
        const userId = event.pathParameters['id'];
        const updateData = JSON.parse(event.body);

        // Connect to MongoDB
        const db = await connectToDatabase();

        // Check if user exists
        const user = await db.collection('users').findOne({ _id: userId });
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
            console.error(error);
            return response.error(error.details[0].message, 400);
        }

        // Check if email or phone is already in use by another user
        if (uniqueFieldChecks.length > 0) {
            const results = await Promise.all(uniqueFieldChecks);
            const duplicateFound = results.some(result => result !== null);
            
            if (duplicateFound) {
                return response.error('Email or phone number is already in use', 409);
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
        await db.collection('users').updateOne(
            { _id: userId }, 
            { $set: updateObject }
        );

        return response.success({ message: 'User updated successfully', user: updateObject });
    } catch (error) {
        console.error('Update user error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = {
    handler,
};