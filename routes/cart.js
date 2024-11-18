const express = require("express");
const router = express.Router();

const { Cart, validateCart } = require("../models/Cart");
const { validateAdmin, userIsLoggedIn } = require("../middlewares/admin");
const { Product } = require("../models/product");


router.get("/", userIsLoggedIn, async (req, res) => {
  try {
    // Find the cart for the logged-in user and populate the products field
    const cart = await Cart.findOne({ user: req.session.passport.user }).populate("products");

    let CartDataStructure = {};

    cart.products.forEach(product=>{
      let key = product._id.toString();
      if(CartDataStructure[key]){
        CartDataStructure[key].quantity += 1;
      }
      else{
        CartDataStructure[key] = {
         ...product._doc,
          quantity: 1,
        };
      }

    })

    let finalarray = Object.values(CartDataStructure);
    finalprice = cart.totalPrice + 34;
    res.render("cart", {cart: finalarray, finalprice: finalprice,userid:req.session.passport.userid});
      
    if (!cart) {
      return res.status(404).send("Cart not found");
    }

    // Send or render the populated cart
  } catch (err) {
    console.error("Error fetching cart:", err.message);
    res.status(500).send("Error fetching cart");
  }
});


router.get("/add/:id", userIsLoggedIn, async function (req, res) {
  try {
    let cart = await Cart.findOne({ user: req.session.passport.user });
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).send("Product not found");
    }

    if (!cart) {
      cart = await Cart.create({
        user: req.session.passport.user,
        products: [req.params.id],
        totalPrice: Number(product.price),
      });
    } else {
      cart.products.push(req.params.id);
      cart.totalPrice = Number(cart.totalPrice) + Number(product.price);
      await cart.save();
    }

    // Respond with updated cart
    res.redirect("back");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get("/add/:id", userIsLoggedIn, async function (req, res) {
  try {
    let cart = await Cart.findOne({ user: req.session.passport.user });
    let product = await Product.findById(req.params.id);

    if (!cart) {
     res.send("There is no items in cart")
    }
     else{
     let prodId = cart.products.indexOf(req.params.id);
      cart.products.splice(prodId,1)
      cart.totalPrice = Number(cart.totalPrice) + Number(product.price);

      await cart.save();
     }

    // Respond with updated cart
    res.redirect("back");
  }catch (err) {
    res.status(500).send(err.message);
  }
});

router.get("/remove/:id", userIsLoggedIn, async function (req, res) {
  try {
    let cart = await Cart.findOne({ user: req.session.passport.user });
    let product = await Product.findById(req.params.id);

    if (!cart) {
     res.send("There is no items in cart")
    }
     else{
     let prodId = cart.products.indexOf(req.params.id);
      cart.products.splice(prodId,1)
      cart.totalPrice = Number(cart.totalPrice) - Number(product.price);

      await cart.save();
     }

    // Respond with updated cart
    res.redirect("back");
  }catch (err) {
    res.status(500).send(err.message);
  }
});



router.get("/remove/:id", userIsLoggedIn, async function (req, res) {
  try {
    let cart = await Cart.findOne({ user: req.session.passport.user });
    if (!cart) {
      return res
        .status(404)
        .send("Something went wrong while removing item from cart");
    }

    let index = cart.products.indexOf(req.params.id);
    if (index !== -1) {
      cart.products.splice(index, 1);
    } else {
      return res.send("Item is not in cart");
    }
    await cart.save();
    res.redirect("back");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
