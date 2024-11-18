const express = require("express");
const router = express.Router();
require("dotenv").config();
const Razorpay = require("razorpay");
const paymentModel = require("../models/Payment.js");

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Route to create an order
router.post("/create/orderId", async (req, res) => {
    const options = {
        amount: 2 * 100, // Amount in paise (2 INR)
        currency: "INR",
    };

    try {
        const order = await razorpay.orders.create(options);
        res.send(order);

        // Create the payment record in the database
        const payment = new paymentModel({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            status: "pending", // Initial status is 'pending'
        });
        await payment.save(); // Save the payment record
    } catch (error) {
        console.log("Error creating order:", error);
        res.status(500).send("Error creating order: " + error.message);
    }
});

// Route to verify payment
router.post("/api/payment/verify", async (req, res) => {
    const { razorpayOrderId, razorpayPaymentId, signature } = req.body;

    // Check if the required fields are present
    if (!razorpayOrderId || !razorpayPaymentId || !signature) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    console.log("Payment verification data:", req.body);

    const secret = process.env.RAZORPAY_KEY_SECRET;

    try {
        // Validate the payment signature
        const { validatePaymentVerification } = require("razorpay/dist/utils/razorpay-utils.js");

        const isValid = validatePaymentVerification(
            { order_id: razorpayOrderId, payment_id: razorpayPaymentId },
            signature,
            secret
        );

        // If the signature is invalid, return error
        if (!isValid) {
            return res.status(400).json({ error: "Invalid signature" });
        }

        // Find the payment record in the database
        const payment = await paymentModel.findOne({ orderId: razorpayOrderId });

        if (!payment) {
            return res.status(404).json({ error: "Payment record not found" });
        }

        // Update payment details
        payment.paymentId = razorpayPaymentId;
        payment.signature = signature;
        payment.status = "completed"; // Set payment status to 'completed'

        // Save the updated payment record
        await payment.save();

        // Return success response
        return res.json({ status: "success", payment });
    } catch (error) {
        console.error("Error verifying payment:", error);
        return res.status(500).json({ error: "Error verifying payment" });
    }
});

module.exports = router;
