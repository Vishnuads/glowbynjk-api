// routes/orderRoutes.js
const express = require('express')
const {getClientInfo,logoutWhatsApp,getQR,ccavResponse,placeOrderAfterCCAvenue, placeOrderAfterPayment,orderGetId,placeOrder, getUserOrders, getSingleOrder, updateOrderStatus,getAllOrders,deleteOrder, trackOrder, createRazorpayOrder, whatsappsend   } = require('../controller/orderController');
const verifyToken = require('../middleware/verifytoken')
const router = express.Router();

// Place new order
router.post("/orders/place-order-ccavenue", placeOrderAfterCCAvenue);
router.post("/ccav-response", ccavResponse);

router.post("/orders/place-order", placeOrder); 
// router.post("/orders/razorpay/create-order", createRazorpayOrder); 
// router.post("/orders/razorpay/place-order",placeOrderAfterPayment)
router.get('/orders/place-order', getAllOrders)
// Get all orders for a user
router.get("/orders/user/:userId", getUserOrders);

// Get a single order by ID
router.get("/orders/:orderId", getSingleOrder);
router.delete("/orders/:orderId", deleteOrder);
// Update order status (admin use)   
router.put("/orders/:orderId/status", updateOrderStatus);

router.post("/orders/track", trackOrder); // <-- tracking route

// Example in Node/Express
router.get("/orders/customer/:orderNumber", orderGetId);
 

router.get("/qr", getQR); 
router.post("/whatsapp/logout", logoutWhatsApp);
router.get("/info", getClientInfo);

router.post('/send-order',whatsappsend)

module.exports=router


 


// const placeOrderAfterCCAvenue = async (req, res) => {
//   try {
//     const {
//       userId,
//       addressId,
//       guestAddress,
//       cartItems,
//       totalAmount,
//       paymentMethod,
//       discountAmount,
//       giftUsedAmount,
//       rewardPoints
//     } = req.body;

//     const redirectUrl = `http://localhost:5000/api/ccav-response`; // change to your frontend

//     // Generate unique order & invoice numbers
//     const orderNumber = `ORD${Date.now()}`;
//     const invoiceNumber = `INV${Date.now()}GL`;

//     // Determine billing & shipping
//     let billing = {};
//     let shipping = {};

//     if (userId && addressId) {
//       const userAddress = await Address.findById(addressId);
//       if (!userAddress) return res.status(400).json({ message: "Address not found" });

//       billing = userAddress.billing || {};
//       shipping = (userAddress.shipToDifferentAddress && userAddress.shipping) ? userAddress.shipping : billing;
//     } else if (guestAddress) {
//       billing = guestAddress.billing || {};
//       shipping = (guestAddress.shipToDifferentAddress && guestAddress.shipping) ? guestAddress.shipping : billing;
//     }

//     // Prepare merchant_param1 (all order info)
//     const merchantParam1 = JSON.stringify({
//       userId,
//       addressId,
//       guestAddress,
//       cartItems,
//       totalAmount,
//       paymentMethod,
//       discountAmount,
//       giftUsedAmount,
//       rewardPoints
//     });

//     // Prepare CCAvenue payload
//     const ccavData = {
//       merchant_id: process.env.CCAVENUE_MERCHANT_ID,
//       order_id: orderNumber,
//       currency: "INR",
//       amount: totalAmount.toFixed(2),
//       redirect_url: redirectUrl,
//       cancel_url: redirectUrl,
//       language: "EN",
//       merchant_param1 : merchantParam1, // all order info
//       // Billing
//       billing_name: `${billing.firstName || ""} ${billing.lastName || ""}`.trim(),
//       billing_address: [billing.streetAddress, billing.apartment].filter(Boolean).join(", "),
//       billing_city: billing.city || "",
//       billing_state: billing.state || "",
//       billing_zip: billing.pincode || "",
//       billing_country: "India",
//       billing_tel: billing.phone || "",
//       billing_email: billing.email || "",
//       // Shipping
//       delivery_name: `${shipping.firstName || ""} ${shipping.lastName || ""}`.trim(),
//       delivery_address: [shipping.streetAddress, shipping.apartment].filter(Boolean).join(", "),
//       delivery_city: shipping.city || "",
//       delivery_state: shipping.state || "",
//       delivery_zip: shipping.pincode || "",
//       delivery_country: "India",
//       delivery_tel: shipping.phone || billing.phone || "",
//       delivery_email: shipping.email || billing.email || ""
//     };

//     // Encrypt payload
//     const plainText = Object.entries(ccavData).map(([k, v]) => `${k}=${v}`).join("&");
//     const encRequest = encryptCCAVenue(plainText);

//     res.status(200).json({
//       encRequest,
//       accessCode: process.env.CCAVENUE_ACCESS_CODE,
//       orderNumber
//     });

//   } catch (err) {
//     console.error("Place Order CCAvenue Error:", err);
//     res.status(500).json({ message: "Failed to create CCAvenue order" });
//   }
// };



// function encryptCCAVenue(plainText) {
//   const key = crypto.createHash("md5").update(workingKey).digest();
//   const iv = Buffer.from([
//     0x00, 0x01, 0x02, 0x03,
//     0x04, 0x05, 0x06, 0x07,
//     0x08, 0x09, 0x0a, 0x0b,
//     0x0c, 0x0d, 0x0e, 0x0f
//   ]);
//   const cipher = crypto.createCipheriv("aes-128-cbc", key, iv);
//   let encrypted = cipher.update(plainText, "utf8", "hex");
//   encrypted += cipher.final("hex");
//   return encrypted;
// }

// function decryptCCAVenue(encText) {
//   const key = crypto.createHash("md5").update(workingKey).digest();
//   const iv = Buffer.from([
//     0x00, 0x01, 0x02, 0x03,
//     0x04, 0x05, 0x06, 0x07,
//     0x08, 0x09, 0x0a, 0x0b,
//     0x0c, 0x0d, 0x0e, 0x0f
//   ]);
//   const decipher = crypto.createDecipheriv("aes-128-cbc", key, iv);
//   let decrypted = decipher.update(encText, "hex", "utf8");
//   decrypted += decipher.final("utf8");
//   return decrypted;
// }

// //
// // =========================================================
// // ✅ 1. PLACE ORDER — Generate encrypted data for CCAvenue
// // =========================================================
//  const placeOrderAfterCCAvenue = async (req, res) => {
//   try {
//     const {
//       userId,
//       addressId,
//       guestAddress,
//       cartItems,
//       totalAmount,
//       paymentMethod,
//       discountAmount,
//       giftUsedAmount,
//       rewardPoints
//     } = req.body;

//     const orderId = `ORD${Date.now()}`;
//     const redirectUrl = "http://localhost:5000/api/ccav-response"; // Your backend response endpoint
//     const cancelUrl = "http://localhost:5000/api/ccav-response";   // Can use same endpoint

//     // ✅ Encode merchant_param1 safely as base64 JSON
//     const merchantParamData = {
//       userId,
//       guestAddress,
//       cartItems,
//       totalAmount,
//       paymentMethod,
//       discountAmount,
//       giftUsedAmount,
//       rewardPoints
//     };

//     const merchant_param1 = Buffer.from(JSON.stringify(merchantParamData)).toString("base64");

//     const postData = `merchant_id=${merchantId}&order_id=${orderId}&currency=INR&amount=${totalAmount}&redirect_url=${redirectUrl}&cancel_url=${cancelUrl}&language=EN&merchant_param1=${merchant_param1}`;

//     const encryptedData = encryptCCAVenue(postData);

//     return res.status(200).json({
//       success: true,
//       orderId,
//   encRequest: encryptedData, // <-- match frontend key
//       accessCode: accessCode // From CCAvenue dashboard
//     });
//   } catch (error) {
//     console.error("CCAvenue Encrypt Error:", error);
//     res.status(500).json({ message: "CCAvenue init failed" });
//   }
// };

// //
// // =========================================================
// // ✅ 2. RESPONSE HANDLER — CCAvenue callback
// // =========================================================
//  const ccavResponse = async (req, res) => {
//   try {
//     const encResp = req.body.encResp;
//     const decrypted = decryptCCAVenue(encResp);

//     const response = Object.fromEntries(decrypted.split("&").map(p => p.split("=")));
//     const paymentStatus = response.order_status;
//     const orderNumber = response.order_id || "UNKNOWN_ORDER";

//     // ✅ Decode and parse merchant_param1
//     let meta = {};
//     try {
//       const decoded = Buffer.from(response.merchant_param1, "base64").toString("utf8");
//       meta = JSON.parse(decoded);
//       console.log("✅ Parsed merchant_param1:", meta);
//     } catch (err) {
//       console.error("❌ merchant_param1 JSON parse failed:", err);
//       console.log("🔹 Raw merchant_param1:", response.merchant_param1);
//     }

//     // ✅ Save order if payment success
//     if (paymentStatus === "Success") {
//         const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

//       const newOrder = new Order({
//         orderNumber,
//         invoiceNumber,
//         userId: meta.userId || null,
//         guestAddress: meta.guestAddress || null,
//         cartItems: meta.cartItems || [],
//         totalAmount: meta.totalAmount || 0,
//         paymentMethod: meta.paymentMethod || "CCAvenue",
//         discountAmount: meta.discountAmount || 0,
//         giftUsedAmount: meta.giftUsedAmount || 0,
//         rewardPoints: meta.rewardPoints || 0,
//         paymentStatus: paymentStatus,
//         paymentDetails: response,
//       });

//       await newOrder.save();
//       console.log("✅ Order saved:", newOrder._id);
//     } else {
//       console.warn(`⚠️ Payment failed for order ${orderNumber}`);
//     }

//     return res.status(200).send("Order processed successfully");
//   } catch (error) {
//     console.error("CCAvenue Callback Error:", error);
//     res.status(500).send("Error processing CCAvenue response");
//   }
// };
