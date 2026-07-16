import { getLoggedUser } from '../services/authHelper.js';

export function getProfile(req, res) {
  const user = getLoggedUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized user." });
  res.json({ user: { id: user.id, fullName: user.fullName, email: user.email, mobileNumber: user.mobileNumber, isAdmin: user.isAdmin, address: user.address } });
}

export function updateProfile(req, res) {
  const user = getLoggedUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized user." });
  const { fullName, mobileNumber, address, state, district, pincode } = req.body;

  user.fullName = fullName || user.fullName;
  user.mobileNumber = mobileNumber || user.mobileNumber;

  if (address || state || district || pincode) {
    user.address = {
      address: address || (user.address?.address || ""),
      state: state || (user.address?.state || ""),
      district: district || (user.address?.district || ""),
      pincode: pincode || (user.address?.pincode || ""),
    };
  }
  res.json({ message: "Profile successfully modified!", user: { id: user.id, fullName: user.fullName, email: user.email, mobileNumber: user.mobileNumber, isAdmin: user.isAdmin, address: user.address } });
}
