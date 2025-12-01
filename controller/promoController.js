// controllers/promoController.js
const Coupon = require("../model/Coupon");
const GiftCard = require("../model/GiftCard");
const mongoose = require("mongoose");

function genCode(prefix = "", length = 8) {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let code = prefix;
  for (let i = 0; i < length; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

exports.createCoupon = async (req, res) => {
  try {
    const { code, type, value, minPurchase, maxDiscount, usageLimit, expiresAt } = req.body;
    // const couponCode = code ? code.toUpperCase() : genCode("CPN-");
        const couponCode = code ? code.toUpperCase() : genCode();
    const coupon = new Coupon({
      code: couponCode,
      type,
      value,
      minPurchase: minPurchase || 0,
      maxDiscount: maxDiscount || null,
      usageLimit: usageLimit || 1,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      createdBy: req.user._id,
    });
    await coupon.save();
    res.status(201).json({ success: true, coupon });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) return res.status(400).json({ error: "Coupon code already exists" });
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Update Coupon
exports.updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, type, value, minPurchase, maxDiscount, usageLimit, expiresAt } = req.body;

    // Find existing coupon
    let coupon = await Coupon.findById(id);
    if (!coupon) return res.status(404).json({ error: "Coupon not found" });

    // Update fields (only if provided)
    if (code) coupon.code = code.toUpperCase();
    if (type) coupon.type = type;
    if (value !== undefined) coupon.value = value;
    if (minPurchase !== undefined) coupon.minPurchase = minPurchase;
    if (maxDiscount !== undefined) coupon.maxDiscount = maxDiscount;
    if (usageLimit !== undefined) coupon.usageLimit = usageLimit;
    if (expiresAt) coupon.expiresAt = new Date(expiresAt);

    await coupon.save();

    res.status(200).json({ success: true, coupon });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) return res.status(400).json({ error: "Coupon code already exists" });
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Get single coupon by ID
exports.getCouponById = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findById(id);

    if (!coupon) {
      return res.status(404).json({ error: "Coupon not found" });
    }

    res.status(200).json({ success: true, coupon });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};



exports.createGiftCard = async (req, res) => {
  try {
    const { code, balance, expiresAt } = req.body;
    // const giftCode = code ? code.toUpperCase() : genCode("GFT-");
    const giftCode = code ? code.toUpperCase() : genCode();
    const gc = new GiftCard({
      code: giftCode,
      balance,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      createdBy: req.user._id
    });
    await gc.save();
    res.status(201).json({ success: true, giftCard: gc });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) return res.status(400).json({ error: "Gift card code already exists" });
    res.status(500).json({ error: "Server error" });
  }
};

// Get single gift card
exports.getGiftCardById = async (req, res) => {
  try {
    const { id } = req.params;
    const giftCard = await GiftCard.findById(id);
    if (!giftCard) return res.status(404).json({ error: "Gift card not found" });
    res.status(200).json({ success: true, giftCard });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Update gift card
exports.updateGiftCard = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, balance, expiresAt } = req.body;

    const giftCard = await GiftCard.findById(id);
    if (!giftCard) return res.status(404).json({ error: "Gift card not found" });

    if (code) giftCard.code = code.toUpperCase();
    if (balance !== undefined) giftCard.balance = balance;
    if (expiresAt) giftCard.expiresAt = new Date(expiresAt);

    await giftCard.save();
    res.status(200).json({ success: true, giftCard });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) return res.status(400).json({ error: "Gift card code already exists" });
    res.status(500).json({ error: "Server error" });
  }
};

// validate coupon — returns discount amount for a given cart total
exports.validateCoupon = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    if (!code) return res.status(400).json({ error: "Code required" });
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), active: true });
    if (!coupon) return res.status(404).json({ error: "Invalid or inactive coupon" });
    if (coupon.expiresAt && coupon.expiresAt < new Date()) return res.status(400).json({ error: "Coupon expired" });
    if (coupon.usageLimit <= (coupon.usedBy?.length || 0)) return res.status(400).json({ error: "Coupon usage limit reached" });
    if (cartTotal < coupon.minPurchase) return res.status(400).json({ error: `Minimum purchase ₹${coupon.minPurchase} required` });

    let discount = 0;
    if (coupon.type === "fixed") discount = coupon.value;
    else if (coupon.type === "percentage") {
      discount = (cartTotal * coupon.value) / 100;
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    }
    discount = Math.min(discount, cartTotal); // cannot exceed total
    return res.json({ success: true, discount, coupon });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// redeem coupon — mark usedBy and return final amount
// exports.redeemCoupon = async (req, res) => {
//   try {
//     const { code, cartTotal } = req.body;
//     const userId = req.user._id;
//     const coupon = await Coupon.findOne({ code: code.toUpperCase(), active: true });
//     if (!coupon) return res.status(404).json({ error: "Invalid or inactive coupon" });
//     if (coupon.expiresAt && coupon.expiresAt < new Date()) return res.status(400).json({ error: "Coupon expired" });

//     // check per-user usage if you want. Here using usedBy array prevents same user multiple times
//     if (coupon.usedBy && coupon.usedBy.includes(userId)) return res.status(400).json({ error: "You have already used this coupon" });
//     if (coupon.usageLimit <= (coupon.usedBy?.length || 0)) return res.status(400).json({ error: "Coupon usage limit reached" });
//     if (cartTotal < coupon.minPurchase) return res.status(400).json({ error: `Minimum purchase ₹${coupon.minPurchase} required` });

//     // calculate discount (same logic as validate)
//     let discount = 0;
//     if (coupon.type === "fixed") discount = coupon.value;
//     else if (coupon.type === "percentage") {
//       discount = (cartTotal * coupon.value) / 100;
//       if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
//     }
//     discount = Math.min(discount, cartTotal);

//     // persist usage
//     coupon.usedBy = coupon.usedBy || [];
//     coupon.usedBy.push(userId);
//     await coupon.save();

//     return res.json({ success: true, discount, finalTotal: cartTotal - discount, coupon });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// };


exports.redeemCoupon = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;

    // ✅ ensure code uppercase
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), active: true });
    if (!coupon) return res.status(404).json({ error: "Invalid or inactive coupon" });

    // ✅ expiration
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return res.status(400).json({ error: "Coupon expired" });
    }

    // ✅ cast userId to ObjectId
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "User not found in token" });
    }
    const userId = new mongoose.Types.ObjectId(req.user._id);

    // ✅ usage checks
    if (coupon.usedBy.some(id => id.equals(userId))) {
      return res.status(400).json({ error: "You have already used this coupon" });
    }
    if (coupon.usageLimit <= (coupon.usedBy?.length || 0)) {
      return res.status(400).json({ error: "Coupon usage limit reached" });
    }
    if (cartTotal < coupon.minPurchase) {
      return res.status(400).json({ error: `Minimum purchase ₹${coupon.minPurchase} required` });
    }
    // ✅ calculate discount
    let discount = 0;
    if (coupon.type === "fixed") discount = coupon.value;
    else if (coupon.type === "percentage") {
      discount = (cartTotal * coupon.value) / 100;
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    }
    discount = Math.min(discount, cartTotal);

    // ✅ persist usage
    coupon.usedBy.push(userId);
    await coupon.save();

    res.json({
      success: true,
      discount,
      finalTotal: cartTotal - discount,
      coupon
    });
  } catch (err) {
    console.error("Redeem error:", err);
    res.status(500).json({ error: "Server error" });
  }
};


exports.validateGiftCard = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: "Code required" });
    const gc = await GiftCard.findOne({ code: code.toUpperCase(), active: true });
    if (!gc) return res.status(404).json({ error: "Invalid gift card" });
    if (gc.expiresAt && gc.expiresAt < new Date()) return res.status(400).json({ error: "Gift card expired" });
    return res.json({ success: true, balance: gc.balance, currency: gc.currency, giftCardId: gc._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.redeemGiftCard = async (req, res) => {
  try {
    const { code, amount, orderId } = req.body;
    if (!code || !amount) return res.status(400).json({ error: "Code and amount required" });
    const gc = await GiftCard.findOne({ code: code.toUpperCase(), active: true });
    if (!gc) return res.status(404).json({ error: "Invalid gift card" });
    if (gc.expiresAt && gc.expiresAt < new Date()) return res.status(400).json({ error: "Gift card expired" });
    if (gc.balance <= 0) return res.status(400).json({ error: "Gift card has no balance" });
    const useAmount = Math.min(amount, gc.balance);
    gc.balance = Math.max(0, gc.balance - useAmount);
    gc.usedTransactions.push({ user: req.user._id, amount: useAmount, date: new Date(), orderId: orderId || null });
    // if balance zero you may keep active=false or keep it for history
    if (gc.balance <= 0) gc.active = false;
    await gc.save();
    return res.json({ success: true, usedAmount: useAmount, remainingBalance: gc.balance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};


// Get all coupons (admin)
exports.getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find()
      .sort({ createdAt: -1 }) // latest first
      .populate("createdBy", "name email"); // optional, to show creator info
    res.json({ success: true, coupons });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Delete coupon by ID (admin)
exports.deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findById(id);
    if (!coupon) return res.status(404).json({ error: "Coupon not found" });
    await Coupon.findByIdAndDelete(id);
    res.json({ success: true, message: "Coupon deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};


// Get all gift cards
 exports.giftCartGed = async (req, res) => {
  try {
    const giftcards = await GiftCard.find().sort({ createdAt: -1 })
      .populate("createdBy", "email")
      // .populate("usedTransactions.user", "email");
        .populate('usedTransactions.user', 'firstName email'); 
    res.json({ giftcards });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Delete gift card
exports.deleteGift =  async (req, res) => {
  try {
    await GiftCard.findByIdAndDelete(req.params.id);
    res.json({ message: "GiftCard deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete failed" });
  }
};
