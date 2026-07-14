import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
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

                const isMatch = await bcrypt.compare(
                    password,
                    user.password
                );

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

      console.log(profile);

      return done(null, profile);

    }
  )
);

export default passport;