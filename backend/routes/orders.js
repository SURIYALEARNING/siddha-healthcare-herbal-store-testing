import express from "express";
import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Coupon from "../models/Coupon.js";
import { allocateFromBatches } from "../controllers/batchController.js";
import { getLoggedUser } from '../services/authHelper.js'
import { verifyToken, verifyAdmin } from '../Auth/authMiddleware.js'
import { calculateOrder } from "../services/orderCalculationService.js";
import { ORDER_STATUSES } from "../constants/orderStatus.js";

const router = express.Router();

router.get("/orders", verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    res.status(500).json({ error: "Failed to fetch orders." });
  }
});

router.post("/orders", verifyToken, async (req, res) => {
  const {
    items,
    shippingAddress,
    mobileNumber,
    email,
    fullName,
    paymentMethod,
    couponCode,
    razorpayPaymentId,
  } = req.body;

  if (!items?.length || !shippingAddress || !mobileNumber || !fullName || !paymentMethod) {
    return res.status(400).json({ error: "All checkout details are required." });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const calculated = await calculateOrder({ items, couponCode });

    for (const item of calculated.items) {
      const allocations = await allocateFromBatches(item.productId, item.quantity, session);
      item.batchAllocations = allocations;
    }

    const now = new Date();
    const initialTimeline = [
      {
        status: ORDER_STATUSES.PENDING,
        title: "Order Placed",
        description: "Your order has been placed successfully.",
        createdAt: now,
        updatedBy: "SYSTEM",
        source: "SYSTEM",
      },
    ];

    if (paymentMethod !== "Cash on Delivery") {
      initialTimeline.push({
        status: ORDER_STATUSES.PENDING,
        title: "Payment Successful",
        description: "Payment has been received successfully.",
        createdAt: now,
        updatedBy: "SYSTEM",
        source: "SYSTEM",
      });
    }

    const newOrder = new Order({
      userId: req.user.id,
      items: calculated.items,
      subtotal: calculated.subtotal,
      couponDiscount: calculated.couponDiscount,
      deliveryCharges: calculated.deliveryCharges,
      total: calculated.total,
      appliedCouponCode: calculated.appliedCouponCode,
      currentStatus: ORDER_STATUSES.PENDING,
      timeline: initialTimeline,
      shippingAddress,
      mobileNumber,
      email,
      fullName,
      paymentMethod,
      paymentStatus: paymentMethod === "Cash on Delivery" ? "Pending" : "Paid",
      shippingStatus: paymentMethod === "Cash on Delivery" ? undefined : "PAID",
      razorpayPaymentId,
    });

    await newOrder.save();

    if (calculated.appliedCouponCode) {
      await Coupon.findOneAndUpdate(
        { code: calculated.appliedCouponCode },
        { $inc: { usedCount: 1 } }
      ).session(session);
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "Order placed successfully!",
      order: newOrder
    });

  } catch (error) {
    console.log('order error:', error.message);

    await session.abortTransaction();
    session.endSession();

    res.status(400).json({
      error: error.message || "An error occurred while processing your order."
    });
  }
});
export default router;
