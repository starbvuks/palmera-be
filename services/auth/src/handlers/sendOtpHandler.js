const { connectToDatabase } = require('../lib/mongodb');
const response = require('../lib/response');
const {sendOTP} = require('../lib/twilioClient');
const Joi = require('joi');

const { v4: uuidv4 } = require('uuid');
const schema = Joi.object({ phone: Joi.string().pattern(/^\+\d{10,15}$/).required() });

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
            return response.error(`Phone number validation error: ${error.details[0].message}`, 400);
        }

        // Check for rate limiting (prevent spam)
        const db = await connectToDatabase();
        const existingOtp = await db.collection('otp_verifications').findOne({ 
            phone: requestData.phone,
            updatedAt: { $gte: new Date(Date.now() - 60 * 1000) } // Within last minute
        });

        if (existingOtp) {
            return response.error('OTP already sent. Please wait 60 seconds before requesting another.', 429);
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Send OTP via Twilio
        let twilioResponse;
        try {
            twilioResponse = await sendOTP(requestData.phone, otp);
        } catch (twilioError) {
            console.error('Twilio API error:', twilioError);
            
            // Handle specific Twilio error codes
            if (twilioError.code === 21211) {
                return response.error('Invalid phone number format', 400);
            } else if (twilioError.code === 21608) {
                return response.error('Phone number is not verified', 400);
            } else if (twilioError.code === 21614) {
                return response.error('Phone number is not mobile', 400);
            } else if (twilioError.code === 21610) {
                return response.error('SMS service not available for this number', 400);
            } else if (twilioError.code === 60200) {
                return response.error('SMS service temporarily unavailable', 503);
            } else if (twilioError.code === 60202) {
                return response.error('SMS service rate limit exceeded', 429);
            } else {
                return response.error('SMS service error. Please try again later.', 503);
            }
        }

        // Store OTP in database
        try {
            const existingUser = await db.collection('otp_verifications').findOne({ phone: requestData.phone });
            
            if (!existingUser) {
                // Insert new OTP record
                const insertData = {
                    ...requestData,
                    _id: uuidv4(),
                    otp: otp,
                    updatedAt: new Date(),
                    createdAt: new Date()
                };
                await db.collection('otp_verifications').insertOne(insertData);
            } else {
                // Update existing OTP record
                await db.collection('otp_verifications').updateOne(
                    { phone: requestData.phone }, 
                    {
                        $set: {
                            otp: otp,
                            updatedAt: new Date()
                        }
                    }
                );
            }
        } catch (dbError) {
            console.error('Database error storing OTP:', dbError);
            return response.error('Failed to store OTP. Please try again.', 500);
        }

        return response.success({
            message: 'OTP sent successfully',
            phone: requestData.phone
        });
    } catch (error) {
        console.error('Send OTP error:', error);
        return response.error('Internal server error', 500);
    }
}

module.exports = {
    handler,
};