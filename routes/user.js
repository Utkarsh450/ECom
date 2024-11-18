const express = require('express');
const { validateAdmin } = require('../middlewares/admin');
const { userModel, validateUser } = require('../models/user');
const router = express.Router();

router.get('/login', (req, res,next) => {
    res.render("user_login");
});

router.get('/profile', (req, res) => {
    res.send("User Profile");
});

router.get('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err); // Passes the error to error-handling middleware.
        }
        req.session.destroy((err) => {
            if (err) {
                return next(err); // Ensures headers are not sent again.
            }
            res.clearCookie("connect.sid"); // Clears session cookie.
            return res.redirect("/users/login"); // Redirect after ensuring no errors.
        });
    });
});

module.exports = router;
