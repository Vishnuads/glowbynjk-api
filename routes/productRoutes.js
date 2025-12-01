
const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const{createProduct,getProducts,getProductById,updateProduct,deleteProduct,videoCommerceCart} = require('../controller/productController')
const router = express.Router();
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

/* ---------- Multer setup ---------- */
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET
// });

// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//       folder: 'glowbynjk/products',
//       public_id: (req, file) => Date.now() + '-' + file.originalname.split('.')[0] + ""
//   },
// });

// const upload = multer({ storage: storage });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/products'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

/* ---------- Routes ---------- */
router.post("/products", upload.array("images", 10), createProduct);
router.get("/products", getProducts);
router.get("/products/video-commerce", videoCommerceCart);
router.get("/products/:id", getProductById);
router.put("/products/:id", upload.array("images", 10), updateProduct);
router.delete("/products/:id", deleteProduct);


module.exports =router
