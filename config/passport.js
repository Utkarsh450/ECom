const GoogleStrategy = require('passport-google-oauth20').Strategy;
const passport = require('passport');
const { userModel } = require('../models/user');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
}, async (accessToken, refreshToken, profile, cb) => {
    try {
        // Using async/await to find or create user
        let user = await userModel.findOne({ email: profile.emails[0].value });
        if (!user) {
            user = new userModel({
                name: profile.displayName,
                email: profile.emails[0].value,
            });
            await user.save();
        }
        return cb(null, user);
    } catch (err) {
        return cb(err);
    }
}));

passport.serializeUser((user, cb) => {
    cb(null, user._id); // add karta hai data in session
}); // aapke kisi bhi data ko backend/session per save karna jab aap google se login akroge to aapko har route pe logged in rakhne ke liye hame aapka unique data save karna hota hai

passport.deserializeUser(async (id, cb) => {
    try {
        const user = await userModel.findOne({ _id: id });// give its data
        cb(null, user);
    } catch (err) {
        cb(err);
    }
});

module.exports = passport;
