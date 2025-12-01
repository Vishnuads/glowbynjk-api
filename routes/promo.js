// routes/promo.js
const express = require("express");
const router = express.Router();
//  const auth = require('../middleware/verifytoken')
 const auth = require('../middleware/auth')

const promoController = require("../controller/promoController");

// admin-only
router.post("/admin/coupon", auth, promoController.createCoupon);
router.put("/admin/coupon/:id", auth, promoController.updateCoupon);
// ✅ GET: Fetch single coupon
router.get("/admin/coupon/:id", auth, promoController.getCouponById);

router.post("/admin/giftcard", auth, promoController.createGiftCard);
router.get("/admin/coupons", auth, promoController.getCoupons); // fetch all coupons
// Delete coupon
router.delete("/admin/coupon/:id", auth, promoController.deleteCoupon);

// user endpoints
router.post("/coupon/validate", auth, promoController.validateCoupon);
router.post("/coupon/redeem", auth, promoController.redeemCoupon);

router.post("/giftcard/validate", promoController.validateGiftCard); // public validate (no auth needed)
router.post("/giftcard/redeem", auth,  promoController.redeemGiftCard);

router.put("/admin/giftcard/:id", promoController.updateGiftCard); 
router.get("/admin/giftcard/:id", promoController.getGiftCardById); 

router.get("/admin/giftcards", auth, promoController.giftCartGed)
router.delete("/admin/giftcard/:id", auth, promoController.deleteGift)
module.exports = router;
