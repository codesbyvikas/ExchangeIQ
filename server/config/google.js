const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");
const User = require("../models/user");

// No need for serialize/deserialize with JWT
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("🔐 Google Profile:", profile);

        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          user = await new User({
            googleId: profile.id,
            name: profile.displayName,
            photo: profile.photos?.[0]?.value || "",
            email: profile.emails?.[0]?.value || "",
            profilePicture: profile.photos?.[0]?.value,
            provider: "google",
          }).save();
        }

        return done(null, user);
      } catch (err) {
        console.error("❌ Error in Google Strategy:", err);
        return done(err, null);
      }
    }
  )
);