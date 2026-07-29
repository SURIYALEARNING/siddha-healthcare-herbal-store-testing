import express from 'express';
import {
  getAdminOrders, getOrderById, updateOrderStatus,
  updateManualShippingStatus, getOrderTimeline, getOrderStats,
  getCustomerOrders, getCustomersList,
  getAdminUsers, getAdminAnalytics, trackOrder,
} from '../controllers/adminController.js';
import { getAdminConsultations } from '../controllers/consultationController.js';
import { verifyAdmin } from '../Auth/authMiddleware.js';

const router = express.Router();

router.get("/orders/stats", verifyAdmin, getOrderStats);
router.get("/orders", verifyAdmin, getAdminOrders);
router.get("/orders/:id/timeline", verifyAdmin, getOrderTimeline);
router.get("/orders/:id", verifyAdmin, getOrderById);
router.put("/orders/:id/status", verifyAdmin, updateOrderStatus);
router.put("/orders/:id/shipping-status", verifyAdmin, updateManualShippingStatus);

router.get("/customers", verifyAdmin, getCustomersList);
router.get("/customers/:userId/orders", verifyAdmin, getCustomerOrders);

router.get("/users", verifyAdmin, getAdminUsers);
router.get("/analytics", verifyAdmin, getAdminAnalytics);
router.get("/consultations", verifyAdmin, getAdminConsultations);

export default router;
