const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { connectToDatabase } = require('../lib/mongodb');
const response = require('../lib/response');
const {
    personalInfoSchema,
    accountStatusSchema,
    authenticationSchema
} = require('../lib/userDAL');

const handler = async (event) => {
    try {
        // Parse request body
        let requestBody;
        try {
            requestBody = JSON.parse(event.body);
        } catch (parseError) {
            return response.error('Invalid JSON in request body', 400);
        }

        const { email, password, firstName, lastName, phone } = requestBody;

        // Validate input
        const personalInfo = {
            email,
            firstName,
            lastName,
            phone,
        }

        const { error } = personalInfoSchema.validate(personalInfo);
        if (error) {
            return response.error(`Validation error: ${error.details[0].message}`, 400);
        }

        // Validate password
        if (!password || password.length < 8) {
            return response.error('Password must be at least 8 characters long', 400);
        }

        // Connect to MongoDB
        let db;
        try {
            db = await connectToDatabase();
        } catch (dbError) {
            console.error('Database connection error:', dbError);
            return response.error('Database connection failed', 503);
        }

        // Check if email exists
        const existingEmail = await db.collection('users').findOne({ "personalInfo.email": email });
        if (existingEmail) {
            return response.error('Email address is already registered', 409);
        }

        // Check if phone exists
        const existingPhone = await db.collection('users').findOne({ "personalInfo.phone": phone });
        if (existingPhone) {
            return response.error('Phone number is already registered', 409);
        }

        // Hash password
        let hashedPassword;
        try {
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(password, salt);
        } catch (hashError) {
            console.error('Password hashing error:', hashError);
            return response.error('Password processing error', 500);
        }

        // Create user object
        let user;
        try {
            const accountStatus = accountStatusSchema.validate({}).value;
            const authentication = authenticationSchema.validate({ passwordHash: hashedPassword }).value;

            user = {
                _id: uuidv4(),
                personalInfo,
                roles: {
                    isHost: false,
                    isSuperhost: false,
                    isAdmin: false
                },
                accountStatus,
                authentication,
                createdAt: new Date(),
                updatedAt: new Date()
            };
        } catch (validationError) {
            console.error('User object validation error:', validationError);
            return response.error('User data validation error', 500);
        }

        // Insert user into database
        try {
            await db.collection('users').insertOne(user);
        } catch (insertError) {
            console.error('User insertion error:', insertError);
            
            // Check if it's a duplicate key error
            if (insertError.code === 11000) {
                if (insertError.keyPattern && insertError.keyPattern['personalInfo.email']) {
                    return response.error('Email address is already registered', 409);
                }
                if (insertError.keyPattern && insertError.keyPattern['personalInfo.phone']) {
                    return response.error('Phone number is already registered', 409);
                }
            }
            
            return response.error('Failed to create user account', 500);
        }

        // Remove sensitive data from response
        const { authentication: _, ...userResponse } = user;

        return response.success(userResponse, 201);
    } catch (error) {
        console.error('Signup error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = {
    handler,
};