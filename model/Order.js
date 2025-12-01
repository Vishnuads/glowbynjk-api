// // models/Order.js
// const mongoose = require('mongoose')

// const orderSchema = new mongoose.Schema(
//   {
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true
//     },
//     addressId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Address", // ✅ reference to Address model
//       required: true
//     },
//         orderNumber: { type: String, unique: true }, // <-- unique order ID
//     cartItems: [
//       {
//         productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
//         title: String,
//         price: Number,
//         quantity: Number,
//         image: String
//       }
//     ],
//     totalAmount: { type: Number, required: true },
//     status: {
//       type: String,
//       enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
//       default: "Pending"
//     },
//     paymentMethod: {
//       type: String,
//       default: "CCAvenue"
//     }
//   },
//   { timestamps: true }
// );

// // export default mongoose.model("Order", orderSchema);
// module.exports = mongoose.model('Order',orderSchema)  





const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    // 🟢 Make userId optional for guest checkout
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false
    },

    // 🟢 Make addressId optional (only required for logged-in users)
    addressId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      required: false
    },

    // 🟢 Add guestAddress for guest checkout orders
    guestAddress: {
      billing: {
        firstName: String,
        lastName: String,
        companyName: String,
        streetAddress: String,
        apartment: String,
        city: String,
        state: String,
        pincode: String,
        phone: String,
        email: String,
        message: String
      },
      shipping: {
        firstName: String,
        lastName: String,
        companyName: String,
        streetAddress: String,
        apartment: String,
        city: String,
        state: String,
        pincode: String
      },
      shipToDifferentAddress: Boolean
    },

    orderNumber: { type: String, unique: true },
    invoiceNumber: { type: String, unique: true },
  
    cartItems: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        title: String,
        netQuantity:String,
        price: Number,
        quantity: Number,
        image: String
      }
    ],

    totalAmount: { type: Number, required: true },
    // paymentId : {type:String, required:true},
      paymentDetails: { type: mongoose.Schema.Types.Mixed, default: {} },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending"
    },
 // ✅ New fields
    estimatedDelivery: { type: Date },
    shippingProvider: { type: String },
    shippingPhone: { type: String },

    // 🟢 Added for payment tracking
 
    paymentStatus: {
      type: String,
      enum: ["Pending", "Success", "Failed", "Cancelled"], // ✅ match CCAvenue
      default: "Pending"
    },

    paymentId: { type: String, default: null },

    paymentMethod: {
      type: String,
      default: "CCAvenue"
    },
    discountAmount: {
      type:String
    },
    giftUsedAmount:{
      type:String
    },
    rewardPoints : {
      type:String
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);

