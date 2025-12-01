const mongoose = require("mongoose");

const subSchema = new mongoose.Schema({
  endpoint: String,
  keys: Object,
});
const Subscription = mongoose.model("Subscription", subSchema);
