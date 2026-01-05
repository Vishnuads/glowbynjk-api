// models/UserCouponUsage.js
const mongoose = require("mongoose");

const userCouponUsageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    unique: true, // 🔴 one coupon per user
    required: true,
  },
  couponCode: String,
  usedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("UserCouponUsage", userCouponUsageSchema);
