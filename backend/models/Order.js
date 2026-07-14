import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product", // Reference to the Product model
    required: true,
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String },
});

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
      required: true,
    },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    couponDiscount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    shippingAddress: {
      address: { type: String, required: true },
      state: { type: String, required: true },
      district: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    mobileNumber: { type: String, required: true },
    email: { type: String, required: true },
    fullName: { type: String, required: true },
    status: {
      type: String,
      enum: ["Ordered", "Shipped", "Delivered", "Cancelled"],
      default: "Ordered",
    },
    paymentMethod: { type: String, required: true },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      required: true,
    },
  },
  { 
    timestamps: true // Automatically creates 'createdAt' and 'updatedAt' fields
  }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;