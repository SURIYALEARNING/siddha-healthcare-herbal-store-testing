import express from "express";
import dotenv from "dotenv";
import connectDB from './database.js';
import cors from "cors";
import passport from "./config/passport.js";

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import checkout from './routes/orders.js';
import cartRoutes from './routes/cart.js';
import authProfileRoutes from './routes/authProfileRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import consultationRoutes from './routes/consultationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import chatbotRoutes from './routes/chatbotRoutes.js';
import { trackOrder } from './controllers/adminController.js';

connectDB();
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(passport.initialize());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date() });
});

app.use("/auth", authRoutes);
app.use("/api/auth/profile", authProfileRoutes);
app.use("/api/products", productRoutes);
app.use("/api/products", reviewRoutes);
app.use("/api", checkout);
app.use("/api/cart", cartRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/consultation", consultationRoutes);
app.use("/api/admin", adminRoutes);
app.get("/api/orders/track/:id", trackOrder);
app.use("/api/chatbot", chatbotRoutes);

const startServer = async () => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Siddha Clinic App running on port http://localhost:${PORT}`);
  });
};

startServer();
