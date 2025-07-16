const express = require("express");
const passport = require("passport");
const checkProfileAndRespond = require("../middlewares/profile");

const router = express.Router();
const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || "http://localhost:5173";

// Start Google OAuth
router.get("/google", passport.authenticate("google", {
  scope: ["profile", "email"]
}));

// Google OAuth Callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/auth/failed",
    session: true,
  }),
  (req, res) => {
    // After login, redirect frontend to fetch session via /google/success
    res.redirect(`${FRONTEND_BASE_URL}/login/success`);
  }
);

// Frontend checks login success and gets user profile
router.get("/google/success", checkProfileAndRespond);

// Login failed
router.get("/failed", (req, res) => {
  res.status(401).json({ success: false, message: "Google login failed" });
});

// Logout
router.get("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) return next(err);
    req.session = null; 
    res.status(200).json({ success: true });
  });
});

module.exports = router;
