const mongoose = require('mongoose');

const productSliderSchema = new mongoose.Schema({
  productname: { type: String, required: true },
  title: { type: String},
  priceone: { type: String },
  pricetwo: { type: String },
  productvideo: { type: String }, 
}, { timestamps: true });

module.exports = mongoose.model('Videocommerce', productSliderSchema);
