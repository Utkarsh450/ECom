const express = require('express');
const router = express.Router();
const {Admin} = require("../models/Admin")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {validateAdmin} = require('../middlewares/admin');
const { Product } = require('../models/product');
const { Category } = require('../models/category');



// if(typeof(process.env.NODE_ENV !== undefined && process.env.NODE_ENV == "development")){
//     console.log("i m in development mode...");
    
    router.post("/create",async function (req, res){
      try{
       let salt = await bcrypt.genSalt(10);
       let hash = await bcrypt.hash("password123", salt);
      let user = new Admin({
            name: "John Doe",
            email: "johndoe@example.com",
            password: hash,
            role:'admin'
        });

        await user.save();

      let token = jwt.sign({ email: "johndoe@example.com", admin:true},process.env.JWT_KEY);
      res.cookie("token", token);
      res.send("admin created successfully");

    }
    catch(err){
        res.status(500).send(err.message);
    }
    
    });

router.get("/login",function(req,res){
    res.render("admin_login");
})

router.post("/login",async function(req,res){
  try{
    const {email,password} = req.body;
    let admin = await Admin.findOne({email:email})
    if(!admin){
      return res.status(404).send("Invalid Credentials");
    }
   let valid = await bcrypt.compare(password,admin.password);
   if(valid){
     let token = jwt.sign({ email: admin.email, admin:true},process.env.JWT_KEY);
     res.cookie("token", token);
     res.redirect("/admin/dashboard");
   }
  }catch(err){
    res.status(500).send(err.message);
  }
})

router.get("/dashboard",validateAdmin,async function(req,res){
  let prodcount = await Product.find().countDocuments();
  let categcount = await Category.find().countDocuments();
    res.render("admin_dashboard",{prodcount:prodcount,categcount:categcount});
})

router.get("/products", validateAdmin, async function (req, res) {
  const resultArray = await Product.aggregate([
    {
      $group:{
        _id:"$category", // actegory ke basis pe saare products leke aa
        products:{$push:"$$ROOT"}, //push kar pura data product ka
      },
    },
    {
      $project:{
        _id:0,
        category:"$_id",
        products:{ $slice: ["$products",10]},
      },
    },
  ])
  const resultObject = resultArray.reduce((acc,item) => {
    acc[item.category] = item.products;
    return acc;
  },{});
  res.render("admin_products",{products:resultObject});


});

router.get("/logout",function(req,res){
  res.cookie("token","");
  res.redirect("/admin/login");
})

router.get("/admin/products/:product_id")

module.exports = router;




