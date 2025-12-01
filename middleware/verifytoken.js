const jwt = require("jsonwebtoken");
// const User = require('../model/userLogin')
const verifyToken = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "No token provided" });
  try {
    // 👇 use the same secret key you used in login/register
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded; // will contain { id, email }

    //  const user = await User.findById(decoded.id);
    // if (!user) return res.status(401).json({ error: "User not found" });

    next();
  } catch (err) {
    console.error("JWT verify error:", err.message);
    res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = verifyToken;
