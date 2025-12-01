// routes/smsRoutes.js
const  sendSMS  = require("../utils/sendSMS.js") ;


const sendUserSms = async (req, res) => {
  const { phone, message } = req.body;
  // Ensure phone has +91 prefix for India
  const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;
 
  try {
    await sendSMS(formattedPhone, message);
    res.json({ success: true, message: "SMS sent successfully!" });
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ success: false, message: "SMS sending failed", error: error.message });
  }
};


module.exports = {sendUserSms}
