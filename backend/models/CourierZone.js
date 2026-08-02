import mongoose from "mongoose";

const courierZoneSchema = new mongoose.Schema(
  {
    courierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Courier",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    states: [{ type: String, trim: true }],
    districts: [{ type: String, trim: true }],
    pincodes: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

courierZoneSchema.index({ courierId: 1, name: 1 });

const CourierZone = mongoose.model("CourierZone", courierZoneSchema);
export default CourierZone;
