const express = require("express");
const passport = require("passport");
const checkProfileAndRespond = require("../middlewares/profile");

const router = express.Router();
const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || "http://localhost:5173";

router.get("/google", passport.authenticate("google", {
  scope: ["profile", "email"]
}));

router.get("/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/auth/failed",
    session: true,
  }),
  (req, res) => {
    res.redirect(`${FRONTEND_BASE_URL}/login/success`);
  }
);

router.get("/google/success", checkProfileAndRespond);

router.get("/failed", (req, res) => {
  res.status(401).json({ success: false, message: "Google login failed" });
});

router.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});

module.exports = router;
