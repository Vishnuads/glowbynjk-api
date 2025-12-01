const express = require("express");
const router = express.Router();
const {sendWhatsApp} = require("../controller/whatsappService");

router.post("/", async (req, res) => {
  try {
    const { to, message } = req.body;

    if (!to || !message) {
      return res.status(400).json({ error: "Recipient and message are required" });
    }
    const result = await sendWhatsApp(to, message);
    res.status(201).json({ success: true, sid: result.sid, status: result.status });
  } catch (error) {
    console.error("Route error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});



module.exports = router;
