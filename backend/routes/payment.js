import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import { verifyToken } from "../Auth/authMiddleware.js";

const router = express.Router();

router.get("/config", (req, res) => {
  res.json({ key: process.env.RAZORPAY_KEY_ID });
});

router.post("/create-order", verifyToken, async (req, res) => {
  try {
    const { amount } = req.body;
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    
    const options = {
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);
    res.json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (error) {
    console.error("Razorpay order creation failed:", error);
    res.status(500).json({ error: "Failed to create payment order" });
  }
});

router.post("/verify", verifyToken, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");
    if (expectedSign === razorpay_signature) {
      res.json({ success: true, razorpayPaymentId: razorpay_payment_id });
    } else {
      res.status(400).json({ error: "Invalid payment signature" });
    }
  } catch (error) {
    console.error("Razorpay verification failed:", error);
    res.status(500).json({ error: "Payment verification failed" });
  }
});

export default router;
