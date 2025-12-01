const mongoose = require('mongoose')
const detailsSchema = new mongoose.Schema({
  modelName: { type: String },
  quantity: { type: String }, // free text (e.g., "200 ml", "1 unit")
  countryOfOrigin: { type: String },
  useBefore: { type: String },
  harshChemicalFree: { type: String }, // "Yes" / "No"
  ingredients: { type: String },
}, { _id: false });

const productSchema = new mongoose.Schema(
  {
    // From your form
    productName: { type: String, required: true },   // dropdown selection
    title: { type: String, required: true },
    prices: [{ type: Number, min: 0 }],  
    netQuantity: [{ type: String}],             // array of numbers
    stockQuantity: { type: Number, default: 0 },     // numeric qty field
    usedQuantity: { type: Number, default: 0 },
    status: { type: String },                        // "New" etc (optional)
    tags: [{ type: String }],                        // react-select tags (values)
    keyBenefits: [{ type: String }],
    description: { type: String },
    details: detailsSchema,
    selectedVideo : {type:String},
    images: [{ type: String }],                      // filenames/URLs
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
// export default mongoose.model("Product", productSchema);
