import express from "express";
import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js"; // Assuming your Product model path
import { getLoggedUser } from '../services/authHelper.js'
import { verifyToken, verifyAdmin } from '../Auth/authMiddleware.js'

const router = express.Router();

router.post("/orders", verifyToken, async (req, res) => {

  console.log(req.user);

  const {
    items,
    subtotal,
    couponDiscount,
    total,
    shippingAddress,
    mobileNumber,
    email,
    fullName,
    paymentMethod,
  } = req.body;

  console.log(items[0].productId);

  // 1. Basic Validation
  if (!items?.length || !shippingAddress || !mobileNumber || !fullName || !paymentMethod) {
    console.log("error 1: All checkout details are required.");
    return res.status(400).json({ error: "All checkout details are required." });
  }

  // 2. Start a Mongoose Session for Transactions
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 3. Stock verification & deduction loop
    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity <= 0) {
        throw new Error("Each item must have a valid productId and positive quantity");
      }


      // ✅ FIXED: Use item.productId instead of items[0].productId
      const prod = await Product.findById(item.productId).session(session);

      if (!prod) {
        console.log(`error 2: Product with ID ${item.productId} not found.`);
        throw new Error(`Product with ID ${item.productId} not found.`);
      }

      if (prod.stock < item.quantity) {
        console.log(`error 3: Not enough stock for ${prod.name}. Only ${prod.stock} left.`);
        throw new Error(`Not enough stock for ${prod.name}. Only ${prod.stock} left.`);
      }

      // Decrement stock in DB
      prod.stock -= item.quantity;
      await prod.save({ session });
    }

    // 4. Create the new order object
    const newOrder = new Order({
      userId: req.user.id,
      items,
      subtotal: Number(subtotal),
      couponDiscount: Number(couponDiscount) || 0,
      total: Number(total),
      shippingAddress,
      mobileNumber,
      email,
      fullName,
      paymentMethod,
      paymentStatus: paymentMethod === "Cash on Delivery" ? "Pending" : "Paid",
    });

    await newOrder.save();

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "Order placed successfully!",
      order: newOrder
    });

  } catch (error) {
    console.log('error 4:', error.message);

    await session.abortTransaction();
    session.endSession();

    res.status(400).json({
      error: error.message || "An error occurred while processing your order."
    });
  }
});
export default router;