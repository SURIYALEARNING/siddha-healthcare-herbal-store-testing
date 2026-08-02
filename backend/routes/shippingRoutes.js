import express from 'express';
import { verifyAdmin, verifyToken } from '../Auth/authMiddleware.js';
import * as shippingController from '../controllers/shippingController.js';
import * as courierController from '../controllers/courierController.js';

const router = express.Router();
const publicRouter = express.Router();

router.get("/orders", verifyAdmin, shippingController.getShippingOrders);
router.get("/stats", verifyAdmin, shippingController.getShippingStats);
router.post("/confirm", verifyAdmin, shippingController.confirmOrder);
router.post("/mark-packed", verifyAdmin, shippingController.markPacked);
router.get("/pickup-locations", verifyAdmin, shippingController.getPickupLocations);
router.post("/sync-pickup-locations", verifyAdmin, shippingController.syncPickupLocations);
router.post("/assign-shiprocket", verifyAdmin, shippingController.assignShiprocket);
router.post("/create-shiprocket-order", verifyAdmin, shippingController.createShiprocketOrder);
router.post("/generate-awb", verifyAdmin, shippingController.generateAWB);
router.post("/request-pickup", verifyAdmin, shippingController.requestPickup);
router.get("/track/:shipmentId", verifyAdmin, shippingController.trackShipment);
router.post("/cancel", verifyAdmin, shippingController.cancelShipment);

router.get("/couriers", verifyAdmin, courierController.getCouriers);
router.post("/couriers", verifyAdmin, courierController.createCourier);
router.put("/couriers/:id", verifyAdmin, courierController.updateCourier);
router.delete("/couriers/:id", verifyAdmin, courierController.deleteCourier);
router.get("/zones", verifyAdmin, courierController.getZones);
router.post("/zones", verifyAdmin, courierController.createZone);
router.put("/zones/:id", verifyAdmin, courierController.updateZone);
router.delete("/zones/:id", verifyAdmin, courierController.deleteZone);
router.get("/rates", verifyAdmin, courierController.getRates);
router.post("/rates", verifyAdmin, courierController.setRate);

publicRouter.post("/check-pincode", shippingController.checkPincode);
publicRouter.get("/check-my-address", verifyToken, shippingController.checkMyAddress);
publicRouter.get("/couriers", courierController.getActiveCouriers);
publicRouter.get("/rates", courierController.getPublicShippingRates);
publicRouter.post("/calculate", courierController.calculateShippingRates);
publicRouter.post("/resolve", courierController.resolveShipping);

export { router, publicRouter };
