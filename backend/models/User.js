import mongoose from "mongoose";

// Temporary Model for OTP verification
const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  fullName: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  password: { type: String, required: true }, // Hashed password will be kept here temporarily
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 } // Auto-deletes after 5 mins
});

const DEFAULT_PERMISSIONS = {
  dashboard: false,
  products: false,
  categories: false,
  orders: false,
  customers: false,
  batches: false,
  reminders: false,
  reviews: false,
  coupons: false,
  carousel: false,
  consultations: false,
  shipping: false,
  staffManagement: false,
};

// Main User Model
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobileNumber: { type: String, default: "" },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  role: { type: String, enum: ["SUPER_ADMIN", "STAFF"], default: "STAFF" },
  isActive: { type: Boolean, default: true },
  permissions: { type: mongoose.Schema.Types.Mixed, default: { ...DEFAULT_PERMISSIONS } },
  lastLogin: { type: Date },
  address: {
    address: { type: String, default: "" },
    state: { type: String, default: "" },
    district: { type: String, default: "" },
    pincode: { type: String, default: "" },
  }
}, { timestamps: true });

export const Otp = mongoose.model('Otp', otpSchema);
export const User = mongoose.model("User", userSchema);