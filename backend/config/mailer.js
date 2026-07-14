import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Your gmail id
    pass: process.env.EMAIL_PASS, // Your google app password
  },
});

export const sendOtpEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Siddha Project - Email Verification OTP',
    html: `<h3>Your Registration OTP is: <b>${otp}</b></h3><p>Valid for 5 minutes only.</p>`,
  };

  return transporter.sendMail(mailOptions);
};