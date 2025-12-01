const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

const WHATSAPP_API_URL = `https://graph.facebook.com/v22.0/${process.env.META_PHONE_NUMBER_ID}/messages`;

const sendWhatsAppMessage = async (req, res) => {
  const { phone, type, message, templateName, templateParams, imageUrl, caption } = req.body;

  if (!phone) {
    return res.status(400).json({ success: false, error: "Phone number required" });
  }

  try {
    let payload;

    if (type === "text") {
      // Text message
      if (!message) {
        return res.status(400).json({ success: false, error: "Text message required" });
      }

      payload = {
        messaging_product: "whatsapp",
        to: phone,
        type: "text",
        text: { body: message },
      };
    } else if (type === "template") {
      if (!templateName) {
        return res.status(400).json({ success: false, error: "Template name required" });
      }

      payload = {
        messaging_product: "whatsapp",
        to: phone,
        type: "template",
        template: {
          name: templateName,
          language: { code: "en_US" },
        },
      };

      if (templateParams && templateParams.length > 0) {
        payload.template.components = [
          {
            type: "body",
            parameters: templateParams.map((param) => ({ type: "text", text: param })),
          },
        ];
      }
    } else if (type === "image") {
      // if (!imageUrl) {
      //   return res.status(400).json({ success: false, error: "Image URL required" });
      // }

const { phone, type, imageUrl, orderId, invoiceNumber, caption } = req.body;

if (type === "image") {
  if (!imageUrl) {
    return res.status(400).json({ success: false, error: "Image URL required" });
  }

  if (!orderId || !invoiceNumber ) {
    return res.status(400).json({ success: false, error: "Order details missing" });
  }

  payload = {
    messaging_product: "whatsapp",
    to: phone,
    type: "image",
    image: {
      link: imageUrl,
      caption: `
Order Confirmation
------------------
Order ID: ${orderId}
Invoice No: ${invoiceNumber}
Track: https://glowbynjk.com/order-tracking/

Thank you for your purchase!
      `,
    },
  };
}


    } else {
      return res.status(400).json({ success: false, error: "Invalid message type" });
    }

    const response = await axios.post(WHATSAPP_API_URL, payload, {
      headers: {
        Authorization: `Bearer ${process.env.META_WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    res.status(200).json({
      success: true,
      message: "WhatsApp message sent successfully",
      data: response.data,
    });
  } catch (error) {
    console.error("WhatsApp API Error:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data || error.message,
    });
  }
};

module.exports = { sendWhatsAppMessage };
