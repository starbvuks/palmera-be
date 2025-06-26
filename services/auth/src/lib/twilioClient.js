const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const sendOTP = async(phone, otp) => {
    try {
        const response= await client.messages.create({
            body: `Your verification code for Palmera is ${otp}, Don't share it with anyone.`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phone
        });
        return response;
    }
    catch (error) {
        console.error('send message error :', error);
        throw error;
    } 
};

module.exports = { sendOTP };