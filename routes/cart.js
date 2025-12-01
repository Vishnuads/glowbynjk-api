const express = require('express');
const router = express.Router();
const { userCartPost, userCartGet, userCartPut, userCartDelete, deleteUserCart,videoCommercePost } = require('../controller/cart.js');
const verifyToken = require('../middleware/verifytoken.js');
const auth = require('../middleware/auth.js');

// Both need verifyToken so we can get req.user.id
router.post('/user/cart', verifyToken, userCartPost);
router.post('/user/cart/videocommerce', verifyToken, videoCommercePost);
router.get('/user/cart', verifyToken, userCartGet);
router.put('/user/cart',verifyToken,userCartPut)
router.delete('/user/cart/:itemId/:netQuantity', verifyToken, userCartDelete);
router.delete("/user/cart", auth, deleteUserCart)


module.exports = router;
