const mongoose = require('mongoose')
const offerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    productName: { type: String, required: true },
    content: { type: String, required: true },
    bannerImages: [String], // multiple banner images
    logo: { type: String }, // logo image
    productImage: { type: String }, // single product image
  },
  { timestamps: true }
);

module.exports = mongoose.model('Offer',offerSchema)  
