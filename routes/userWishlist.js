const express =  require('express');
const { getWishlist, addToWishlist, removeFromWishlist, clearWishlist, removeMultiple } = require('../controller/userWishlist.js');
// import {
//   getWishlist,
//   addToWishlist,
//   removeFromWishlist,
//   clearWishlist,
// } from "../controllers/wishlistController.js";
// import { protect } from "../middleware/authMiddleware.js";
 const verifyToken = require('../middleware/verifytoken.js')
 const router = express.Router();

router.get("/wishlist", verifyToken, getWishlist);
router.post("/wishlist", verifyToken, addToWishlist);
router.delete("/wishlist/:productId/:netQuantity", verifyToken, removeFromWishlist);
router.delete("/wishlist", verifyToken, clearWishlist);
router.delete("/wishlist/remove-multiple", verifyToken, removeMultiple);

// export default router;
module.exports = router
