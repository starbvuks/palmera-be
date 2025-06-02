const { connectToDatabase } = require('../lib/mongodb');
const response = require('../lib/response');
const Joi = require('joi');
const jwt = require('jsonwebtoken');

const schema = Joi.object({
    phone: Joi.string().required(),
    otp: Joi.string().length(6).required()
});

const generateTokens = (userId) => {
    const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
  };

const handler = async (event) => {
    try {
        const requestData = JSON.parse(event.body);
        const { error } = schema.validate(requestData);
        if (error) {
            console.error(error);
            return response.error(error.details[0].message, 400);
        }

        // Connect to MongoDB
        const db = await connectToDatabase();

        // Check if user exists
        const user = await db.collection('otp_verifications').findOne({ phone: requestData.phone });
        if (!user) {
            return response.error('User not found', 404);
        }

        // Check if OTP is valid
        if (user.otp !== requestData.otp) {
            return response.error('Invalid OTP', 400);
        }

        // Generate tokens
        const tokens = generateTokens(user._id);

        // Store refresh tokens
        await db.collection('refreshTokens').insertOne({
            userId: user._id,
            token: tokens.refreshToken,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            });

            
        return response.success({
            message: 'OTP verified successfully',...tokens
        });
    } catch (error) {
        console.error('Verify OTP error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = {
    handler,
};