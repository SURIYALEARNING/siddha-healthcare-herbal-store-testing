import mongoose from "mongoose";

const batchAllocationSchema = new mongoose.Schema({
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: "Batch" },
  batchNumber: { type: String },
  quantity: { type: Number, required: true },
}, { _id: false });

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String },
  batchAllocations: [batchAllocationSchema],
});

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
    razorpayPaymentId: { type: String },
    razorpayOrderId: { type: String },
    shippingStatus: {
      type: String,
      enum: [
        "PAID", "CONFIRMED", "PACKED", "PICKUP_REQUESTED",
        "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY",
        "DELIVERED", "RETURNED", "CANCELLED",
      ],
      default: "PAID",
    },
    shiprocketOrderId: { type: String },
    awbCode: { type: String },
    courierName: { type: String },
    trackingLink: { type: String },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
