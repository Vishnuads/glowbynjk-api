// utils/notificationService.js
const Notification = require('../model/Notification');
const  sendEmail = require("./emailService.js");
const  sendSMS  = require("./sendSMS.js");
const  sendWhatsApp = require("./whatsappService.js");
// import Notification from "../models/Notification.js";
// import { sendEmail } from "./emailService.js";
// import { sendSMS } from "./smsService.js";
// import { sendWhatsApp } from "./whatsappService.js";

 const sendNotification = async ({ userId, type, to, subject, message }) => {
  try {
    if (type === "EMAIL") await sendEmail(to, subject, message);
    if (type === "SMS") await sendSMS(to, message);
    if (type === "WHATSAPP") await sendWhatsApp(to, message);

    await Notification.create({ user: userId, type, to, subject, message, status: "SENT", sentAt: new Date() });
  } catch (err) {
    await Notification.create({ user: userId, type, to, subject, message, status: "FAILED" });
    console.error("Notification failed:", err);
  }
};

module.exports = sendNotification;
