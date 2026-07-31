import { PendingUser, User } from "../models/User.js";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs"; // Password safe-ah veika
import 'dotenv/config';



// Nodemailer Config (Use Gmail App Password)
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER, // Unge Gmail
        pass: process.env.EMAIL_PASS, // Google App Password
    },
});

// 1. Initial Register (Send OTP)
export const registerStep1 = async (req, res) => {
    console.log("reched");

    try {
        const { fullName, email, mobileNumber, password } = req.body;

        // Check if user already exists in main DB
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Email already registered." });

        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save or Update in Pending Collection
        const PendingUse = await PendingUser.findOneAndUpdate(
            { email },
            { fullName, email, mobileNumber, password: hashedPassword, otp },
            { upsert: true, new: true },
            { $set: { status: 'active' } },
            { new: true }
        );

        if (PendingUse) {
            console.log("pending user data created in db");
            console.log("My Email User is:", process.env.EMAIL_USER);
        }

        // Send Mail
        try {


            const sendmai = await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: "Your Registration OTP",
                text: `Your OTP for registration is: ${otp}. It will expire in 10 minutes.`,
            });
            if (sendmai) {
                console.log("OTP sent to your email successfully!");

            }
        } catch (error) {
            console.log("sendmail:", error);

        }


        res.status(200).json({ message: "OTP sent to your email successfully!" });
    } catch (error) {
        res.status(500).json({ error: "Registration failed. Please try again." });
    }
};

// 2. Verify OTP
export const verifyOTP = async (req, res) => {
    const { email, otp } = req.body;
    console.log(email, otp );
    
    try {
        const { email, otp } = req.body;
        const pendingData = await PendingUser.findOne({ email });

        if (!pendingData || pendingData.otp !== otp) {
            return res.status(400).json({ message: "Invalid or expired OTP." });
        }

        res.status(200).json({ message: "OTP verified successfully. Please provide address details." });
    } catch (error) {
        res.status(500).json({ error: "Verification failed. Please try again." });
    }
};

// 3. Final Step: Save User with Address
export const finalRegister = async (req, res) => {
    try {
        const { email, address, state, district, pincode } = req.body;

        const pendingData = await PendingUser.findOne({ email });
        if (!pendingData) return res.status(400).json({ message: "Session expired. Restart registration." });

        // Create main user document
        const newUser = new User({
            fullName: pendingData.fullName,
            email: pendingData.email,
            mobileNumber: pendingData.mobileNumber,
            password: pendingData.password,
            isAdmin: false, // Default user
            address: { address, state, district, pincode }
        });

        await newUser.save();
        await PendingUser.deleteOne({ email }); // Clear temp data

        res.status(201).json({ message: "User registered successfully!", user: newUser });
    } catch (error) {
        res.status(500).json({ error: "Registration failed. Please try again." });
    }
};