const jwt = require("jsonwebtoken");
const User = require("../models/user");

const authCheck = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; 
    
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth check error:", err);
    return res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = authCheck;