const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");
const User = require("../models/user");

// FIX: Use user._id instead of user.id
passport.serializeUser((user, done) => {
    console.log("Serializing user:", user._id);
    done(null, user._id);  // Changed from user.id to user._id
});

passport.deserializeUser(async (id, done) => {
    try {
        console.log("Deserializing user ID:", id);
        const user = await User.findById(id);
        if (user) {
            console.log("User deserialized successfully:", user.email);
        } else {
            console.log("User not found during deserialization");
        }
        done(null, user);
    } catch (err) {
        console.error("Deserialize error:", err);
        done(err, null);
    }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("Google Strategy - Profile ID:", profile.id);
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          console.log("Creating new user");
          user = await new User({
            googleId: profile.id,
            name: profile.displayName,
            photo: profile.photos?.[0]?.value || "",
            email: profile.emails?.[0]?.value || "",
            profilePicture: profile.photos?.[0]?.value,
            provider: "google",
          }).save();
          console.log("New user created:", user.email);
        } else {
          console.log("Existing user found:", user.email);
        }

        return done(null, user);
      } catch (err) {
        console.error("Google strategy error:", err);
        return done(err, null);
      }
    }
  )
);