import express from 'express';
import { verifyAdmin } from '../Auth/authMiddleware.js';
import * as shippingController from '../controllers/shippingController.js';

const router = express.Router();

router.get("/orders", verifyAdmin, shippingController.getShippingOrders);
router.get("/stats", verifyAdmin, shippingController.getShippingStats);
router.post("/confirm", verifyAdmin, shippingController.confirmOrder);
router.post("/mark-packed", verifyAdmin, shippingController.markPacked);
router.post("/create-shiprocket-order", verifyAdmin, shippingController.createShiprocketOrder);
router.post("/generate-awb", verifyAdmin, shippingController.generateAWB);
router.post("/request-pickup", verifyAdmin, shippingController.requestPickup);
router.get("/track/:shipmentId", verifyAdmin, shippingController.trackShipment);
router.post("/cancel", verifyAdmin, shippingController.cancelShipment);

export default router;
