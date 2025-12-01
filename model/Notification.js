// models/Notification.js
// import mongoose from "mongoose";
const mongoose = require('mongoose');
const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  type: { type: String, enum: ["EMAIL", "SMS", "WHATSAPP"], required: true },
  to: String, // email or phone number
  subject: String, // for email
  message: String,
  status: { type: String, enum: ["PENDING", "SENT", "FAILED"], default: "PENDING" },
  sentAt: Date
}, { timestamps: true });

// export default mongoose.model("Notification", notificationSchema);
module.exports = mongoose.model("Notification", notificationSchema);
