const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const checkProfileAndRespond = require("../middlewares/profile");
const authCheck = require("../middlewares/auth");

const router = express.Router();
const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || "http://localhost:5173";

// JWT token generation utility
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id, 
      email: user.email, 
      name: user.name 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

// Start Google OAuth
router.get("/google", passport.authenticate("google", {
  scope: ["profile", "email"],
  session: false // Disable session for JWT
}));

// Google OAuth Callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/auth/failed",
    session: false, // Disable session for JWT
  }),
  (req, res) => {
    // Generate JWT token
    const token = generateToken(req.user);
    
    // Redirect with token as query parameter (temporary)
    res.redirect(`${FRONTEND_BASE_URL}/login/success?token=${token}`);
  }
);

// Frontend checks login success and gets user profile
router.get("/google/success", authCheck, checkProfileAndRespond);

// Login failed
router.get("/failed", (req, res) => {
  res.status(401).json({ success: false, message: "Google login failed" });
});

router.post("/logout", (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: "Logout successful. Please remove token from client." 
  });
});

// Token refresh endpoint (optional)
router.post("/refresh", authCheck, (req, res) => {
  const newToken = generateToken(req.user);
  res.json({ success: true, token: newToken });
});

module.exports = router;