import mongoose from "mongoose";

const batchAllocationSchema = new mongoose.Schema({
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: "Batch" },
  batchNumber: { type: String },
  quantity: { type: Number, required: true },
}, { _id: false });

const timelineEntrySchema = new mongoose.Schema({
  status: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedBy: { type: String, default: "SYSTEM" },
  source: {
    type: String,
    enum: ["SYSTEM", "STAFF", "SHIPROCKET"],
    default: "SYSTEM",
  },
}, { _id: false });

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: { type: String, required: true },
  image: { type: String },
  purchasedPrice: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  itemTotal: { type: Number, required: true },
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
    deliveryCharges: { type: Number, default: 0 },
    total: { type: Number, required: true },
    appliedCouponCode: { type: String },
    shippingAddress: {
      address: { type: String, required: true },
      state: { type: String, required: true },
      district: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    mobileNumber: { type: String, required: true },
    email: { type: String, required: true },
    fullName: { type: String, required: true },

    shippingMethod: {
      type: String,
      enum: ["SHIPROCKET", "MANUAL"],
      default: "MANUAL",
    },

    currentStatus: {
      type: String,
      default: "Pending",
    },

    timeline: [timelineEntrySchema],

    tracking: {
      courierName: { type: String },
      awbNumber: { type: String },
      trackingUrl: { type: String },
      estimatedDelivery: { type: Date },
      shippedAt: { type: Date },
      deliveredAt: { type: Date },
    },

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
    },
    shiprocketOrderId: { type: String },
    awbCode: { type: String },
    courierName: { type: String },
    trackingLink: { type: String },
    shiprocketDetails: {
      shipmentId: { type: String },
      pickupId: { type: String },
      pickupStatus: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ currentStatus: 1 });
orderSchema.index({ shippingMethod: 1 });
orderSchema.index({ "timeline.createdAt": -1 });

const Order = mongoose.model("Order", orderSchema);
export default Order;
