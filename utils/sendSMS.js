// utils/sendSMS.js
const twilio = require('twilio')
const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

const sendSMS = async (to, message) => {
  try {
    const response = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER, // Twilio number
      to: to.toString() // ensure it's string with +91
    });
    console.log("SMS sent successfully:", response.sid); 
  } catch (error) {
    console.error("Error sending SMS:", error);
    throw error; // rethrow to handle in route
  }
};


module.exports = sendSMS;
