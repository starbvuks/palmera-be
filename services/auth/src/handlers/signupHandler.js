const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { connectToDatabase } = require('../lib/mongodb');
const response = require('../lib/response');
const {
    personalInfoSchema
} = require('../../../users/src/lib/userDAL');

const {
    accountStatusSchema
} = require('../../../users/src/lib/userDAL');

const {
    authenticationSchema
} = require('../../../users/src/lib/userDAL');

const handler = async(event) => {
    try {
        const { email, password, firstName, lastName, phone } = JSON.parse(event.body);

        // Connect to MongoDB
        const db = await connectToDatabase();

        // Validate input
        const personalInfo = {
            email,
            firstName,
            lastName,
            phone,
        }

        // Validate input
        const { error } = personalInfoSchema.validate(personalInfo);
        if (error) {
            console.error(error);
            return response.error(error.details[0].message, 400);
        }

        // Check if email exists
        const existingEmail = await db.collection('users').findOne({ "personalInfo.email": email });
        if (existingEmail) {
            return response.error('Email already registered', 409);
        }

        // Check if phone exists
        const existingPhone = await db.collection('users').findOne({ "personalInfo.phone": phone });
        if (existingPhone) {
            return response.error('Phone number already registered', 409);
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const accountStatus = accountStatusSchema.validate({}).value
        authentication = authenticationSchema.validate({ passwordHash: hashedPassword }).value

        // Create user
        const user = {
            _id: uuidv4(),
            personalInfo,
            role: {
                isHost: false,
                isSuperhost: false,
                isAdmin: false
            },
            accountStatus,
            authentication,
        };

        await db.collection('users').insertOne(user);

        // Remove password from response
        delete user.password;

        return response.success(user, 201);
    } catch (error) {
        console.error('Signup error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = {
    handler,
};