const mongoose = require("mongoose");

const AddressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
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
    message: String,
  },
  shipping: {
    firstName: String,
    lastName: String,
    companyName: String,
    streetAddress: String,
    apartment: String,
    city: String,
    state: String,
    pincode: String,
  },
  shipToDifferentAddress: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Address", AddressSchema);
