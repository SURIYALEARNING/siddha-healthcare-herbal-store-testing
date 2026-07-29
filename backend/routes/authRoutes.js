import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Otp } from '../models/User.js';
import 'dotenv/config';
import passport from "passport";
import "../config/passport.js";


import { sendOtpEmail } from '../config/mailer.js';

// Secret keys (Keep these in your .env file)
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;




const router = express.Router();

// 1. REGISTER - Generate & Send OTP
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, mobileNumber, password } = req.body;

    // Check user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already registered" });

    // Generate 6 Digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash Password before keeping it temporarily
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save registration info + OTP temporary store down check query
    await Otp.findOneAndDelete({ email }); // Delete old OTP if any

    await Otp.create({
      email,
      fullName,
      mobileNumber,
      password: hashedPassword,
      otp
    });

    // Send Mail
    await sendOtpEmail(email, otp);

    res.status(200).json({ success: true, message: "OTP sent to email successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. VERIFY OTP - Create Permanent User
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find temporary entry
    const otpRecord = await Otp.findOne({ email, otp });
    console.log({ email, otp });

    if (!otpRecord) return res.status(400).json({ message: "Invalid OTP or Expired" });

    // Move data to main User Schema (Address is skipped/empty by default)
    const newUser = new User({
      fullName: otpRecord.fullName,
      email: otpRecord.email,
      mobileNumber: otpRecord.mobileNumber,
      password: otpRecord.password, // already hashed
      // address uses schema defaults implicitly
    });

    await newUser.save();

    // Clear OTP database entry
    await Otp.deleteOne({ _id: otpRecord._id });

    res.status(200).json({ success: true, message: "User registered successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});





router.post(

  "/login",

  passport.authenticate(
    "local",
    {
      session: false
    }
  ),

  async (req, res) => {

    const { user } = req
    try {

      // 3. Return user data (Exclude password for security)
      const userData = {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobileNumber: user.mobileNumber,
        isAdmin: user.isAdmin,
        role: user.role || "STAFF",
        isActive: user.isActive !== false,
        permissions: user.permissions || {},
        address: user.address // This will send empty fields if not updated yet
      };

      // Update lastLogin
      await User.findByIdAndUpdate(user._id, { $set: { lastLogin: new Date() } });

      // 3. Generate Tokens (Payload la role based authorization-ku 'isAdmin' add panrom)
      const accessToken = jwt.sign(
        { id: user.id, isAdmin: user.isAdmin, role: user.role || "STAFF" },
        ACCESS_TOKEN_SECRET,
        { expiresIn: '59m' }
      );

      const refreshToken = jwt.sign(
        { id: user.id },
        REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
      );


      // 4. Send Refresh Token inside an HTTP-Only Cookie (Highly Secure)
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        success: true,
        accessToken,
        message: "Login successful!",
        user: userData
      });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

);



router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  (req, res) => {
    const user = req.user;
    const userData = {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      mobileNumber: user.mobileNumber,
      isAdmin: user.isAdmin,
      role: user.role || "STAFF",
      isActive: user.isActive !== false,
      permissions: user.permissions || {},
      address: user.address,
    };

    const accessToken = jwt.sign(
      { id: user.id, isAdmin: user.isAdmin, role: user.role || "STAFF" },
      ACCESS_TOKEN_SECRET,
      { expiresIn: '59m' }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const userEncoded = encodeURIComponent(JSON.stringify(userData));
    res.redirect(`${frontendUrl}/auth?accessToken=${accessToken}&user=${userEncoded}`);
  }
);




// 4. UPDATE PROFILE - Modify standard fields and address info
// Frontend sends: { fullName, mobileNumber, address, state, district, pincode }
router.post('/logout', (_req, res) => {
  res.cookie('refreshToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    maxAge: 0,
  });
  res.json({ success: true, message: 'Logged out.' });
});

router.post('/refresh', async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ message: "No refresh token provided." });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, REFRESH_TOKEN_SECRET);
    } catch {
      return res.status(401).json({ message: "Invalid or expired refresh token." });
    }

    const user = await User.findById(decoded.id).lean();
    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }

    const accessToken = jwt.sign(
      { id: user._id.toString(), isAdmin: user.isAdmin, role: user.role || "STAFF" },
      ACCESS_TOKEN_SECRET,
      { expiresIn: '59m' }
    );

    const refreshToken = jwt.sign(
      { id: user._id.toString() },
      REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const userData = {
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      mobileNumber: user.mobileNumber,
      isAdmin: user.isAdmin,
      role: user.role || "STAFF",
      isActive: user.isActive !== false,
      permissions: user.permissions || {},
      address: user.address,
    };

    res.json({ success: true, accessToken, user: userData });
  } catch (error) {
    res.status(500).json({ message: "Server error during token refresh." });
  }
});

router.put('/update-profile/:userId', async (req, res) => {

  
  try {
    const { userId } = req.params;
    const { fullName, mobileNumber, address, state, district, pincode } = req.body;
  
    

    if (!fullName || !mobileNumber) {
      return res.status(400).json({ success: false, error: "Full name and mobile number are required." });
    }

    const updateFields = {
      fullName,
      mobileNumber,
    };

    if (address || state || district || pincode) {
      updateFields["address.address"] = address || "";
      updateFields["address.state"] = state || "";
      updateFields["address.district"] = district || "";
      updateFields["address.pincode"] = pincode || "";
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, error: "User not found." });
    }

    const userData = {
      id: updatedUser._id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      mobileNumber: updatedUser.mobileNumber,
      isAdmin: updatedUser.isAdmin,
      role: updatedUser.role || "STAFF",
      isActive: updatedUser.isActive !== false,
      permissions: updatedUser.permissions || {},
      address: updatedUser.address,
    };

    res.status(200).json({
      success: true,
      message: "Profile updated successfully!",
      user: userData,
    });

  } catch (error) {
    console.error("Update profile error:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, error: "Invalid data provided." });
    }
    res.status(500).json({ success: false, error: "Server error. Profile update failed." });
  }
});

export default router;