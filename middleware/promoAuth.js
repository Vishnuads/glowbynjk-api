// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("'../model/adminLogin"); // ✅ import User model

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    // get user from DB
    const user = await User.findById(decoded.id).select("_id role");
    if (!user) return res.status(401).json({ error: "User not found" });

    req.user = user; // ✅ attach to request
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = auth
