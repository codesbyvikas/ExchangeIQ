const express = require("express");
const passport = require("passport");
const checkProfileAndRedirect = require('../middlewares/profile');

const router = express.Router();

router.get("/google", passport.authenticate("google", {
  scope: ["profile", "email"],
}));

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/", 
  }),
  checkProfileAndRedirect 
);

router.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});

module.exports = router;
