import { User } from '../models/User.js';

export async function getProfile(req, res) {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) return res.status(401).json({ error: "Unauthorized user." });
    res.json({
      user: {
        id: user._id, fullName: user.fullName, email: user.email,
        mobileNumber: user.mobileNumber, isAdmin: user.isAdmin, address: user.address,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch profile." });
  }
}

export async function updateProfile(req, res) {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) return res.status(401).json({ error: "Unauthorized user." });

    const { fullName, mobileNumber, address, state, district, pincode } = req.body;

    if (fullName) user.fullName = fullName;
    if (mobileNumber) user.mobileNumber = mobileNumber;

    if (address || state || district || pincode) {
      user.address = {
        address: address || (user.address?.address || ""),
        state: state || (user.address?.state || ""),
        district: district || (user.address?.district || ""),
        pincode: pincode || (user.address?.pincode || ""),
      };
    }

    await user.save();

    res.json({
      message: "Profile successfully modified!",
      user: {
        id: user._id, fullName: user.fullName, email: user.email,
        mobileNumber: user.mobileNumber, isAdmin: user.isAdmin, address: user.address,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update profile." });
  }
}
