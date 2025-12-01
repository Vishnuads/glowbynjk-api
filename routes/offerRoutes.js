const express = require('express')
const multer = require('multer');
const { createOffer, getOffers, deleteOffer, updateOffer } = require('../controller/offerController.js');
// import { createOffer, getOffers } from "../controllers/offerController.js";
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const router = express.Router();

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET
// });

// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//       folder: 'glowbynjk/home',
//       public_id: (req, file) => Date.now() + '-' + file.originalname.split('.')[0] + ""
//   },
// });

// const upload = multer({ storage: storage });


const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/home'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });



// Route: create offer
router.post(
  "/offer/banner",
  upload.fields([
    { name: "bannerImages", maxCount: 5 },
    { name: "logo", maxCount: 1 },
    { name: "productImage", maxCount: 1 },
  ]),
  createOffer
);

// Route: get all offers
router.get("/offer/banner", getOffers);

router.put(
  "/offer/banner/:id",
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "productImage", maxCount: 1 },
    { name: "bannerImages", maxCount: 10 }
  ]),
  updateOffer
);

router.delete("/offer/banner/:id", deleteOffer);

module.exports = router