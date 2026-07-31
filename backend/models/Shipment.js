import mongoose from "mongoose";

const trackingEntrySchema = new mongoose.Schema({
  status: { type: String },
  location: { type: String },
  timestamp: { type: Date, default: Date.now },
  message: { type: String },
}, { _id: false });

const shipmentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  shipmentId: { type: String },
  shiprocketOrderId: { type: String },
  awbCode: { type: String },
  courierName: { type: String },
  pickupStatus: { type: String },
  trackingStatus: { type: String },
  trackingHistory: [trackingEntrySchema],
  pickupScheduledAt: { type: Date },
  deliveredAt: { type: Date },
  labelUrl: { type: String },
  manifestUrl: { type: String },
  dimensions: {
    length: { type: Number },
    breadth: { type: Number },
    height: { type: Number },
  },
  weight: { type: Number },
}, { timestamps: true });

const Shipment = mongoose.model("Shipment", shipmentSchema);
export default Shipment;
