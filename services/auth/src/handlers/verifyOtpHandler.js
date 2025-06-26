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
        // Parse request body
        let requestData;
        try {
            requestData = JSON.parse(event.body);
        } catch (parseError) {
            return response.error('Invalid JSON in request body', 400);
        }

        // Validate input
        const { error } = schema.validate(requestData);
        if (error) {
            return response.error(`Validation error: ${error.details[0].message}`, 400);
        }

        // Connect to MongoDB
        let db;
        try {
            db = await connectToDatabase();
        } catch (dbError) {
            console.error('Database connection error:', dbError);
            return response.error('Database connection failed', 503);
        }

        // Check if OTP record exists
        const otpRecord = await db.collection('otp_verifications').findOne({ phone: requestData.phone });
        if (!otpRecord) {
            return response.error('No OTP found for this phone number. Please request a new OTP.', 404);
        }

        // Check if OTP is expired (15 minutes)
        const otpAge = Date.now() - new Date(otpRecord.updatedAt).getTime();
        const otpExpiryTime = 15 * 60 * 1000; // 15 minutes in milliseconds
        
        if (otpAge > otpExpiryTime) {
            return response.error('OTP has expired. Please request a new OTP.', 410);
        }

        // Check if OTP is valid
        if (otpRecord.otp !== requestData.otp) {
            return response.error('Invalid OTP. Please check and try again.', 400);
        }

        // Check if user exists in main users collection
        const user = await db.collection('users').findOne({ "personalInfo.phone": requestData.phone });
        if (!user) {
            return response.error('User not found. Please sign up first.', 404);
        }

        // Check if account is active
        if (user.accountStatus && user.accountStatus.status === 'suspended') {
            return response.error('Account has been suspended. Please contact support.', 403);
        }

        if (user.accountStatus && user.accountStatus.status === 'deactivated') {
            return response.error('Account has been deactivated. Please contact support.', 403);
        }

        // Generate tokens
        let tokens;
        try {
            tokens = generateTokens(user._id);
        } catch (tokenError) {
            console.error('Token generation error:', tokenError);
            return response.error('Authentication service error', 500);
        }

        // Store refresh token
        try {
            await db.collection('refreshTokens').insertOne({
                userId: user._id,
                token: tokens.refreshToken,
                createdAt: new Date(),
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            });
        } catch (tokenStoreError) {
            console.error('Token storage error:', tokenStoreError);
            return response.error('Authentication service error', 500);
        }

        // Clean up OTP record after successful verification
        try {
            await db.collection('otp_verifications').deleteOne({ phone: requestData.phone });
        } catch (cleanupError) {
            console.error('OTP cleanup error:', cleanupError);
            // Don't fail the request for cleanup errors
        }

        return response.success({
            message: 'OTP verified successfully',
            user: {
                _id: user._id,
                personalInfo: user.personalInfo,
                roles: user.roles
            },
            ...tokens
        });
    } catch (error) {
        console.error('Verify OTP error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = {
    handler,
};