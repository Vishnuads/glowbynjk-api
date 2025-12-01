const express = require("express");
const { sendWhatsAppMessage } = require("../controller/metaWhatsappController");

const router = express.Router();

// === POST /api/whatsapp/send ===
router.post("/meta/whatsapp/send", sendWhatsAppMessage);

module.exports = router;
