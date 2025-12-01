// models/Blog.js
const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  category: { type: String, required: true },
  title: { type: String, required: true },
  blogimage: { type: String }, // store URL (local / cloudinary)
  description: { type: String, required: true }
}, { timestamps: true });

// export default mongoose.model("Blog", blogSchema);
module.exports = mongoose.model("Blog", blogSchema);