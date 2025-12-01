// utils/whatsappService.js
const twilio = require('twilio');
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

const sendWhatsApp = async (to, message) => {
  try {
    const recipient = to.startsWith("+") ? `whatsapp:${to}` : `whatsapp:+91${to}`;

    const response = await client.messages.create({
      body: message,
      from: "whatsapp:+14155238886", // Official Twilio sandbox number
      to: recipient
    });

    console.log("WhatsApp sent:", response.sid); 
  } catch (error) {
    console.error("WhatsApp error:", error);
    throw error;
  }
};

module.exports = sendWhatsApp;
