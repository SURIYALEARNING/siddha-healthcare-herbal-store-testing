import mongoose from "mongoose";

const pickupLocationSchema = new mongoose.Schema({
  id: Number,
  pickup_location: String,
  address: String,
  address_2: String,
  city: String,
  state: String,
  country: String,
  pin_code: String,
  email: String,
  phone: String,
  name: String,
  company_id: Number,
  status: Number,
  phone_verified: Number,
  lat: String,
  long: String,
  is_primary_location: Number,
  rto_address_id: Number,
  alternate_phone: String,
  gstin: String,
  open_time: String,
  close_time: String,
  instruction: String,
  warehouse_code: String,
}, { _id: false, strict: false });

const shiprocketSettingsSchema = new mongoose.Schema({
  pickupLocations: { type: [pickupLocationSchema], default: [] },
  companyName: { type: String },
  lastSyncedAt: { type: Date },
}, { timestamps: true });

const ShiprocketSettings = mongoose.model("ShiprocketSettings", shiprocketSettingsSchema);
export default ShiprocketSettings;
