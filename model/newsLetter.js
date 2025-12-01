const mongoose = require("mongoose");

// Newsletter schema
const newsletterSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  subscribedAt: { type: Date, default: Date.now }
});

// const Newsletter = mongoose.model("Newsletter", newsletterSchema);
module.exports = mongoose.model("Newsletter", newsletterSchema);
