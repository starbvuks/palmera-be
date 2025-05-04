const { connectToDatabase } = require('../../../auth/src/lib/mongodb');
const response = require('../../../auth/src/lib/response');
const Joi = require('joi');

const schema = Joi.object({
    phone: Joi.string().required(),
    otp: Joi.string().length(6).required()
});


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

        return response.success({
            message: 'OTP verified successfully'
        });
    } catch (error) {
        console.error('Verify OTP error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = {
    handler,
};