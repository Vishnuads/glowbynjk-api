// models/Coupon.js
const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  type: { type: String, enum: ["percentage", "fixed"], default: "fixed" },
  value: { type: Number, required: true }, // percentage (10) or fixed amount (500)
  minPurchase: { type: Number, default: 0 },
  maxDiscount: { type: Number, default: null }, // optional cap for percentage coupons
  usageLimit: { type: Number, default: 1 }, // total redemptions allowed
  usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // track users (optional)
  expiresAt: { type: Date, default: null },
  active: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // admin
}, { timestamps: true });

module.exports = mongoose.model("Coupon", couponSchema);
