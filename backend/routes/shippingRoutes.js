import express from 'express';
import { verifyAdmin, verifyToken } from '../Auth/authMiddleware.js';
import * as shippingController from '../controllers/shippingController.js';

const router = express.Router();
const publicRouter = express.Router();

router.get("/orders", verifyAdmin, shippingController.getShippingOrders);
router.get("/stats", verifyAdmin, shippingController.getShippingStats);
router.post("/confirm", verifyAdmin, shippingController.confirmOrder);
router.post("/mark-packed", verifyAdmin, shippingController.markPacked);
router.get("/pickup-locations", verifyAdmin, shippingController.getPickupLocations);
router.post("/assign-shiprocket", verifyAdmin, shippingController.assignShiprocket);
router.post("/create-shiprocket-order", verifyAdmin, shippingController.createShiprocketOrder);
router.post("/generate-awb", verifyAdmin, shippingController.generateAWB);
router.post("/request-pickup", verifyAdmin, shippingController.requestPickup);
router.get("/track/:shipmentId", verifyAdmin, shippingController.trackShipment);
router.post("/cancel", verifyAdmin, shippingController.cancelShipment);

publicRouter.post("/check-pincode", shippingController.checkPincode);
publicRouter.get("/check-my-address", verifyToken, shippingController.checkMyAddress);

export { router, publicRouter };
