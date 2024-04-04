
const dotenv = require('dotenv');
dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const toNumber = process.env.TO_NUMBER;

const client = require('twilio')(accountSid, authToken);

const sendSMS = async (body) => {
    let msgOptions = {
        from: twilioPhoneNumber,
        to: toNumber,
        body: body
    };
    try {
        const message = await client.messages.create(msgOptions);
        console.log("Message sent:", message.sid);
    } catch (error) {
        console.error("Error sending message:", error);
    }
};

module.exports = { sendSMS };
