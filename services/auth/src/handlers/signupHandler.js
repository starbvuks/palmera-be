const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { connectToDatabase } = require('../lib/mongodb');
const response = require('../lib/response');

const handler = async(event) => {
    try {
        const { email, password, firstName, lastName, phone } = JSON.parse(event.body);

        // Connect to MongoDB
        const db = await connectToDatabase();

        // Check if email exists
        const existingEmail = await db.collection('users').findOne({ email });
        if (existingEmail) {
            return response.error('Email already registered', 409);
        }

        // Check if phone exists
        const existingPhone = await db.collection('users').findOne({ phone });
        if (existingPhone) {
            return response.error('Phone number already registered', 409);
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = {
            _id: uuidv4(),
            email,
            password: hashedPassword,
            firstName,
            lastName,
            phone,
            role: 'user',
            createdAt: new Date(),
            updatedAt: new Date(),
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