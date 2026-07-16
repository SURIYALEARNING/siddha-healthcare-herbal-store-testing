import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { User } from "../models/User.js";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

passport.use(
    new LocalStrategy(
        {
            usernameField: "email",
            passwordField: "password"
        },
        async (email, password, done) => {
            try {
                const user = await User.findOne({ email });
                console.log(user);
                if (!user) {
                    return done(null, false, {
                        message: "User Not Found"
                    });
                }
                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) {
                    return done(null, false, {
                        message: "Wrong Password"
                    });
                }
                return done(null, user);
            } catch (error) {
                console.log(error.message);
                return done(error);
            }
        }
    )
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error("No email from Google profile"), null);

        let user = await User.findOne({ email });

        if (!user) {
          const name = profile.displayName || email.split("@")[0];
          const randomPassword = crypto.randomBytes(32).toString("hex");
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(randomPassword, salt);

          user = new User({
            fullName: name,
            email,
            mobileNumber: "",
            password: hashedPassword,
          });
          await user.save();
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

export default passport;
