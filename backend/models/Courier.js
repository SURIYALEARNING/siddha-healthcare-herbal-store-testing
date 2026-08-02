import mongoose from "mongoose";

const courierSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    logo: { type: String, default: "" },
    description: { type: String, default: "" },
    trackingUrl: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

courierSchema.index({ name: 1 });
courierSchema.index({ isActive: 1 });

const Courier = mongoose.model("Courier", courierSchema);
export default Courier;
