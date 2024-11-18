const express = require("express");
const paymentModel = require("../models/Payment");
const router = express.Router();
const { Mera } = require("../models/Mera");
const { Cart } = require("../models/Cart");

router.get("/:userid/:orderid/:paymentid/:signature",async function (req, res) {
  let paymentdetails = await paymentModel.findOne({
    orderId: req.params.orderid,
  });

  if (!paymentdetails) return res.send("Sorry, no payment");
  if (
    req.params.signature == paymentdetails.signature &&
    req.params.paymentid === paymentdetails.paymentId
  ) {
    let cart = await Cart.findOne({ user:req.params.userid});
   await Mera.create({
            orderId: req.params.orderid,
            user: req.params.userid,
            products: cart.products,
            totalPrice: cart.totalPrice,
            status:"processing",
            paymentMethod: paymentdetails._id
           
    })
    return res.redirect(`/map/${req.params.orderid}`);
  }
  return res.send("Invalid payment details");
});

router.post("/address/:orderid", async function (req, res) {
  let order = await Mera.findOne({ orderId: req.params.orderid });
  if (!order) return res.send("Sorry, this order does not exist");
  if (!req.body.address) return res.send("You must provide an address");
  order.address = req.body.address;
  order.save();
});

module.exports = router;
