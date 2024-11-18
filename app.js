const express  =require('express');
const app = express();
require("dotenv").config();
require("./config/mongoose");
const passport = require("./config/passport");
const indexRouter = require('./routes');
const authRoutes = require('./routes/auth');
const productRouter = require('./routes/products');
const expressSession = require('express-session');
const adminRouter = require("./routes/admin");
const path = require('path');
const categoriesRouter = require("./routes/categories");
const userRouter = require("./routes/user");
const cartRouter = require("./routes/cart");
const paymentRouter = require("./routes/payment");
const orderRouter = require("./routes/Mera");

let CookieParser = require("cookie-parser");

app.use(CookieParser());

app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended:true}));
app.use(express.static(path.join(__dirname,"public",)));
app.use(expressSession({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
}))
app.use(passport.initialize());
app.use(passport.session());
app.use("/", indexRouter);
app.use("/auth", authRoutes);
app.use("/admin", adminRouter);
app.use("/products", productRouter);
app.use("/categories",categoriesRouter);
app.use("/users", userRouter);
app.use("/cart", cartRouter);
app.use("/payment",paymentRouter);
app.use("/order", orderRouter);

app.listen(3000)