const mongoose = require('mongoose');

const productSliderSchema = new mongoose.Schema({
  productname: { type: String, required: true },
  title: { type: String, required: true },
  priceone: { type: String, required: true },
  pricetwo: { type: String },
  productimage: { type: String }, // product image file name
  offerimage: { type: String },   // offer image file name
}, { timestamps: true });

module.exports = mongoose.model('ProductImageSlider', productSliderSchema);
