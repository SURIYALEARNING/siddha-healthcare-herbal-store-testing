import mongoose from "mongoose";

const shiprocketAuthSchema = new mongoose.Schema({
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

const ShiprocketAuth = mongoose.model("ShiprocketAuth", shiprocketAuthSchema);
export default ShiprocketAuth;
