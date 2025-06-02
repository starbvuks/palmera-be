const { connectToDatabase } = require('../lib/mongodb');
const response = require('../lib/response');
const {sendOTP} = require('../lib/twilioClient');
const Joi = require('joi');

const { v4: uuidv4 } = require('uuid');
const schema = Joi.object({ phone: Joi.string().pattern(/^\+\d{10,15}$/).required() });

const handler = async (event) => {
    try {
        const requestData = JSON.parse(event.body);
        const { error } = schema.validate(requestData);
        if (error) {
            console.error(error);
            return response.error(error.details[0].message, 400);
        }
        const otp =  Math.floor(100000 + Math.random() * 900000).toString();
        const twilloResponse= await sendOTP(requestData.phone, otp);
    
        if (twilloResponse.errorCode !== null) {
            console.error('Error sending OTP:', twilloResponse);
            return twilloResponse.error('Failed to send OTP', 500);
        }
        // Connect to MongoDB
        const db = await connectToDatabase();
        // Check if user exists
        const user = await db.collection('otp_verifications').findOne({ phone: requestData.phone });
        if (!user) {
            // Insert new user
            const insertData = {
                ...requestData,
                _id: uuidv4(),
                otp: otp,
                updatedAt: new Date(),
                createdAt: new Date()
            };
            await db.collection('otp_verifications').insertOne(insertData);
        } else {
            // Update user
            await db.collection('otp_verifications').updateOne({ phone: requestData.phone }, {
                $set: {
                    otp: otp,
                    updatedAt: new Date()
                }
            });
        }

        return response.success({
            message: 'OTP sent successfully'
        });
    } catch (error) {
        console.error(' send otp error:', error);
        return response.error('Internal server error', 500);
    }
}

module.exports = {
    handler,
};