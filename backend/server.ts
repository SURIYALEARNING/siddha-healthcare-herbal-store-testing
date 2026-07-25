import express from "express";
import dotenv from "dotenv";
import connectDB from './database.js';
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "./config/passport.js";

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';

import checkout from './routes/orders.js';
import cartRoutes from './routes/cart.js';
import authProfileRoutes from './routes/authProfileRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import consultationRoutes from './routes/consultationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import chatbotRoutes from './routes/chatbotRoutes.js';
import paymentRoutes from './routes/payment.js';
import { router as adminShippingRoutes, publicRouter as publicShippingRoutes } from './routes/shippingRoutes.js';
import Shipment from './models/Shipment.js';
import Order from './models/Order.js';
import { trackOrder } from './controllers/adminController.js';

connectDB();
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 8080;

const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
};
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(passport.initialize());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date() });
});

app.use("/auth", authRoutes);
app.use("/api/auth/profile", authProfileRoutes);
app.use("/api/products", productRoutes);
app.use("/api/products", uploadRoutes);
app.use("/api/categories", categoryRoutes);

app.use("/api", reviewRoutes);
app.use("/api", checkout);
app.use("/api/cart", cartRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/consultation", consultationRoutes);
app.use("/api/admin", adminRoutes);
app.get("/api/orders/track/:id", trackOrder);
app.use("/api/payment", paymentRoutes);
app.use("/api/admin/shipping", adminShippingRoutes);
app.use("/api/shipping", publicShippingRoutes);
app.use("/api/chatbot", chatbotRoutes);

app.post("/api/webhooks/shiprocket", express.raw({ type: "application/json" }), async (req, res) => {
  try {
    const event = req.body;
    if (event?.shipment_id && event?.current_status) {
      const statusMap = {
        "PICKED UP": "PICKED_UP",
        "IN TRANSIT": "IN_TRANSIT",
        "OUT FOR DELIVERY": "OUT_FOR_DELIVERY",
        "DELIVERED": "DELIVERED",
        "RETURNED": "RETURNED",
        "CANCELLED": "CANCELLED",
      };
      const status: string = event.current_status;
      const mapped = (statusMap as Record<string, string>)[status] || status;
      const shipment = await Shipment.findById(event.shipment_id);
      if (shipment) {
        await Order.findByIdAndUpdate(shipment.orderId, {
          $set: {
            shippingStatus: mapped,
            ...(mapped === "DELIVERED" ? { status: "Delivered" } : {}),
          },
        });
        if (mapped === "DELIVERED") {
          shipment.deliveredAt = new Date();
        }
        shipment.trackingStatus = mapped;
        if (event.history) shipment.trackingHistory = event.history;
        await shipment.save();
      }
    }
    res.status(200).json({ status: "ok" });
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

const startServer = async () => {


  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Siddha Clinic App running on port http://localhost:${PORT}`);
  });
};

startServer();
