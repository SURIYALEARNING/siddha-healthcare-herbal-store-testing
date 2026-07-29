import bcrypt from "bcryptjs";
import { User } from "../models/User.js";

const STAFF_PERMISSIONS_KEYS = [
  "dashboard", "products", "categories", "orders", "customers",
  "batches", "reminders", "reviews", "coupons", "carousel",
  "consultations", "shipping", "staffManagement",
];

export function getDefaultPermissions() {
  const perms = {};
  STAFF_PERMISSIONS_KEYS.forEach((key) => { perms[key] = false; });
  return perms;
}

export async function getStaffList() {
  return User.find({ role: "STAFF" })
    .select("-password")
    .sort({ createdAt: -1 })
    .lean();
}

export async function getStaffById(id) {
  return User.findOne({ _id: id, role: "STAFF" })
    .select("-password")
    .lean();
}

export async function createStaff({ fullName, email, mobileNumber, password, permissions }) {
  const existing = await User.findOne({ email });
  if (existing) throw new Error("Email already registered.");

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const perms = getDefaultPermissions();
  if (permissions && typeof permissions === "object") {
    STAFF_PERMISSIONS_KEYS.forEach((key) => {
      if (permissions[key] === true) perms[key] = true;
    });
  }

  const user = await User.create({
    fullName,
    email,
    mobileNumber,
    password: hashedPassword,
    role: "STAFF",
    isAdmin: true,
    isActive: true,
    permissions: perms,
  });

  const { password: _, ...userData } = user.toObject();
  return userData;
}

export async function updateStaff(id, { fullName, mobileNumber, permissions, isActive }) {
  const updateFields = {};
  if (fullName !== undefined) updateFields.fullName = fullName;
  if (mobileNumber !== undefined) updateFields.mobileNumber = mobileNumber;
  if (isActive !== undefined) updateFields.isActive = isActive;

  if (permissions && typeof permissions === "object") {
    const user = await User.findById(id).lean();
    if (!user || user.role !== "STAFF") throw new Error("Staff not found.");

    const mergedPerms = { ...user.permissions };
    STAFF_PERMISSIONS_KEYS.forEach((key) => {
      if (permissions[key] === true) mergedPerms[key] = true;
      else if (permissions[key] === false) mergedPerms[key] = false;
    });
    updateFields.permissions = mergedPerms;
  }

  const updated = await User.findByIdAndUpdate(id, { $set: updateFields }, { new: true })
    .select("-password")
    .lean();

  return updated;
}

export async function updateStaffStatus(id, isActive) {
  const user = await User.findByIdAndUpdate(id, { $set: { isActive } }, { new: true })
    .select("-password")
    .lean();
  return user;
}

export async function resetStaffPassword(id, newPassword) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  const user = await User.findByIdAndUpdate(id, { $set: { password: hashedPassword } }, { new: true })
    .select("-password")
    .lean();
  return user;
}

export async function deleteStaff(id) {
  await User.deleteOne({ _id: id, role: "STAFF" });
}
