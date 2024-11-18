const jwt = require("jsonwebtoken");
require("dotenv").config();
async function validateAdmin(req,res,next){
    try{
    let token = req.cookies.token;
    if(!token) return res.send("you need to log in first");
    let data = await jwt.verify(token,process.env.JWT_KEY );
    req.user = data;
    next();
    }catch(err){
        res.status(403).send(err.message);
    }
}

async function userIsLoggedIn(req,res,next){
    if(req.isAuthenticated()) // guven by passport
    return next();;
    res.redirect("/users/login")
}

module.exports = {validateAdmin, userIsLoggedIn};