const mongoose = require('mongoose');

const customerReviewSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    customername: {
      type: String,
      required: true,
    },
    customeremail: {
      type: String,
      required: true,
    },
    customermessage: {
      type: String,
      required: true,
    },
     approved: {   // ✅ New field
      type: Boolean,
      default: false, // default not approved
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProductComment", customerReviewSchema);
