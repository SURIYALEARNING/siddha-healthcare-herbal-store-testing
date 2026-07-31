import express from 'express';
import cookieParser from 'cookie-parser';
import passport from 'passport';

import authRoutes from '../../routes/authRoutes.js';
import productRoutes from '../../routes/productRoutes.js';
import uploadRoutes from '../../routes/uploadRoutes.js';
import categoryRoutes from '../../routes/categoryRoutes.js';
import checkout from '../../routes/orders.js';
import cartRoutes from '../../routes/cart.js';
import authProfileRoutes from '../../routes/authProfileRoutes.js';
import reviewRoutes from '../../routes/reviewRoutes.js';
import blogRoutes from '../../routes/blogRoutes.js';
import couponRoutes from '../../routes/couponRoutes.js';
import consultationRoutes from '../../routes/consultationRoutes.js';
import adminRoutes from '../../routes/adminRoutes.js';
import carouselRoutes from '../../routes/carouselRoutes.js';
import batchRoutes from '../../routes/batchRoutes.js';
import reminderRoutes from '../../routes/reminderRoutes.js';
import staffRoutes from '../../routes/staffRoutes.js';
import analyticsRoutes from '../../routes/analyticsRoutes.js';
import paymentRoutes from '../../routes/payment.js';
import { router as adminShippingRoutes, publicRouter as publicShippingRoutes } from '../../routes/shippingRoutes.js';
import { trackOrder } from '../../controllers/adminController.js';
import Shipment from '../../models/Shipment.js';
import Order from '../../models/Order.js';
import { maybeCreateRemindersForOrder } from '../../services/reminderService.js';

export function createTestApp() {
  const app = express();

  app.use(cookieParser());
  app.use(passport.initialize());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date() });
  });

  app.use('/auth', authRoutes);
  app.use('/api/auth/profile', authProfileRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/products', uploadRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api', reviewRoutes);
  app.use('/api', checkout);
  app.use('/api/cart', cartRoutes);
  app.use('/api/blogs', blogRoutes);
  app.use('/api/coupons', couponRoutes);
  app.use('/api/consultation', consultationRoutes);
  app.use('/api/admin', adminRoutes);
  app.get('/api/orders/track/:id', trackOrder);
  app.use('/api/payment', paymentRoutes);
  app.use('/api/admin/shipping', adminShippingRoutes);
  app.use('/api/shipping', publicShippingRoutes);
  app.use('/api/carousel', carouselRoutes);
  app.use('/api/admin/batches', batchRoutes);
  app.use('/api/admin/reminders', reminderRoutes);
  app.use('/api/admin/staff', staffRoutes);
  app.use('/api/admin/dashboard', analyticsRoutes);

  app.post('/api/webhooks/shiprocket', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
      const event = req.body;
      if (event?.shipment_id && event?.current_status) {
        const statusMap: Record<string, string> = {
          'PICKED UP': 'PICKED_UP', 'IN TRANSIT': 'IN_TRANSIT',
          'OUT FOR DELIVERY': 'OUT_FOR_DELIVERY', DELIVERED: 'DELIVERED',
          RETURNED: 'RETURNED', CANCELLED: 'CANCELLED',
        };
        const mapped = statusMap[event.current_status] || event.current_status;
        const shipment = await Shipment.findById(event.shipment_id);
        if (shipment) {
          const order = await Order.findById(shipment.orderId);
          if (order && order.currentStatus !== 'Delivered') {
            await Order.findByIdAndUpdate(shipment.orderId, {
              $set: {
                shippingStatus: mapped,
                ...(mapped === 'DELIVERED' ? { status: 'Delivered' } : {}),
              },
              $push: {
                timeline: {
                  status: mapped === 'DELIVERED' ? 'Delivered' : 'Shipped',
                  title: statusMap[event.current_status] ? { 'PICKED UP': 'Pickup Completed', 'IN TRANSIT': 'In Transit', 'OUT FOR DELIVERY': 'Out For Delivery', DELIVERED: 'Delivered', RETURNED: 'Returned', CANCELLED: 'Cancelled' }[event.current_status] || event.current_status : event.current_status,
                  description: event.current_status,
                  createdAt: new Date(),
                  updatedBy: 'SHIPROCKET',
                  source: 'SHIPROCKET',
                },
              },
            });
          }
          if (mapped === 'DELIVERED') {
            shipment.deliveredAt = new Date();
            maybeCreateRemindersForOrder(shipment.orderId).catch(() => {});
          }
          shipment.trackingStatus = mapped;
          if (event.history) shipment.trackingHistory = event.history;
          await shipment.save();
        }
      }
      res.status(200).json({ status: 'ok' });
    } catch {
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  });

  return app;
}
