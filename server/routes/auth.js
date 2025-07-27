const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const checkProfileAndRespond = require("../middlewares/profile");
const authCheck = require("../middlewares/auth");

const router = express.Router();
const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || "http://localhost:5173";

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

router.get("/google", passport.authenticate("google", {
  scope: ["profile", "email"],
  session: false 
}));

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/auth/failed",
    session: false, 
  }),
  (req, res) => {
    const token = generateToken(req.user);
    
    res.redirect(`${FRONTEND_BASE_URL}/login/success?token=${token}`);
  }
);

router.get("/google/success", authCheck, checkProfileAndRespond);

router.get("/failed", (req, res) => {
  res.status(401).json({ success: false, message: "Google login failed" });
});

router.post("/logout", (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: "Logout successful. Please remove token from client." 
  });
});

router.post("/refresh", authCheck, (req, res) => {
  const newToken = generateToken(req.user);
  res.json({ success: true, token: newToken });
});

module.exports = router;