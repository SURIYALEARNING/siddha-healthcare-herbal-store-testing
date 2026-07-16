import express from 'express';
import { getAdminOrders, updateOrderStatus, getAdminUsers, getAdminAnalytics } from '../controllers/adminController.js';
import { getAdminConsultations } from '../controllers/consultationController.js';
import { verifyAdmin } from '../Auth/authMiddleware.js';

const router = express.Router();

router.get("/orders", verifyAdmin, getAdminOrders);
router.put("/orders/:id/status", verifyAdmin, updateOrderStatus);
router.get("/users", verifyAdmin, getAdminUsers);
router.get("/analytics", verifyAdmin, getAdminAnalytics);
router.get("/consultations", verifyAdmin, getAdminConsultations);

export default router;
