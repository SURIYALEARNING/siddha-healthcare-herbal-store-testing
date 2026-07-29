import mongoose from "mongoose";

const shiprocketAuthSchema = new mongoose.Schema({
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  pickupLocations: { type: [{ name: String, address: String, email: String, phone: String }], default: [] },
}, { timestamps: true });

const ShiprocketAuth = mongoose.model("ShiprocketAuth", shiprocketAuthSchema);
export default ShiprocketAuth;
