const mongoose = require('mongoose')

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  phone: { type: String },
  email: { type: String },
  items: [
   {
      _id: { type: String, required: true },  // product ID
      title: String,
      productName:String,
      images: [String],
      netQuantity: String,
      prices: Number,
      quantity: Number,
    },
  ],
  reminderSent: { type: Boolean, default: false }, // ✅ New flag
  reminderSentAt: { type: Date }, // optional for logs
},
{ timestamps: true } 
);

module.exports = mongoose.model('Cart',cartSchema)  

