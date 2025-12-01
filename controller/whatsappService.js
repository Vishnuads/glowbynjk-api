// const twilio = require('twilio');
// const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

// const sendWhatsApp = async (to, message) => {
//   try {
//     // If number doesn’t start with +, prefix Indian code (+91)
//     const recipient = to.startsWith("+") ? `whatsapp:${to}` : `whatsapp:+91${to}`;

//     const response = await client.messages.create({
//       body: message,
//       from: "whatsapp:+14155238886", // ✅ Official Twilio Sandbox number
//       to: recipient
//     });

//     console.log("WhatsApp sent:", response.sid);
//     return response.sid;
//   } catch (error) {
//     console.error("WhatsApp error:", error.message);
//     throw error;
//   }
// };

// module.exports = sendWhatsApp;
const twilio = require("twilio");
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

const sendWhatsApp = async (to, message) => {
  try {
    // Auto prefix +91 for Indian numbers if not already present
    const recipient = to.startsWith("+") ? `whatsapp:${to}` : `whatsapp:+91${to}`;

    console.log("Sending WhatsApp to:", recipient);

    const response = await client.messages.create({
      body: message,
      from: process.env.TWILIO_WHATSAPP_NUMBER, // ✅ sandbox number
      to: recipient,
    });

    console.log("WhatsApp sent, SID:", response.sid);
    return response;
  } catch (error) {
    console.error("WhatsApp error:", error.message);
    throw error;
  }
};



module.exports= {sendWhatsApp}
