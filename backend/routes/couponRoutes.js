import express from 'express';
import { getCoupons, applyCoupon, manageCoupon } from '../controllers/couponController.js';
import { verifyAdmin } from '../Auth/authMiddleware.js';

const router = express.Router();

router.get("/", getCoupons);
router.post("/apply", applyCoupon);
router.post("/manage", verifyAdmin, manageCoupon);

export default router;
