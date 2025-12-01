// models/GiftCard.js
const mongoose = require("mongoose");

const giftCardSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  balance: { type: Number, required: true, min: 0 },
  currency: { type: String, default: "INR" },
  expiresAt: { type: Date, default: null },
  active: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // admin
  usedTransactions: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    amount: Number,
    date: Date,
    orderId: String
  }]
}, { timestamps: true });

module.exports = mongoose.model("GiftCard", giftCardSchema);
