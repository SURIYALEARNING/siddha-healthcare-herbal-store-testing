import express from 'express';
import { getAdminOrders, updateOrderStatus, getAdminUsers, getAdminAnalytics } from '../controllers/adminController.js';
import { getAdminConsultations } from '../controllers/consultationController.js';

const router = express.Router();

router.get("/orders", getAdminOrders);
router.put("/orders/:id/status", updateOrderStatus);
router.get("/users", getAdminUsers);
router.get("/analytics", getAdminAnalytics);
router.get("/consultations", getAdminConsultations);

export default router;
