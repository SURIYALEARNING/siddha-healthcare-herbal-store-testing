import mongoose from "mongoose";

const courierRateSchema = new mongoose.Schema(
  {
    zoneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CourierZone",
      required: true,
      unique: true,
      index: true,
    },
    upTo500g: { type: Number, min: 0, default: 0 },
    upTo1kg: { type: Number, min: 0, default: 0 },
    additionalKg: { type: Number, min: 0, default: 0 },
  },
  { timestamps: true }
);

const CourierRate = mongoose.model("CourierRate", courierRateSchema);
export default CourierRate;
