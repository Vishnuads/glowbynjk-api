// const jwt = require('jsonwebtoken')

// const auth = (req, res, next) => {
//   const token = req.header("Authorization")?.replace("Bearer ", "");
//   if (!token) return res.status(401).json({ error: "No token provided" });

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded;
//     next();
//   } catch (err) {
//     res.status(401).json({ error: "Invalid token" });
//   }
// }

// module.exports = auth


const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "No token provided" });
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    // ✅ Map to _id
    req.user = {
      _id: decoded.id,    // your login should sign {id: user._id}
      email: decoded.email
    };
    next();
  } catch (err) {
    console.error("JWT verify error:", err.message);
    res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = verifyToken;
