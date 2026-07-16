import express from 'express';
import { getCoupons, applyCoupon, manageCoupon } from '../controllers/couponController.js';

const router = express.Router();

router.get("/", getCoupons);
router.post("/apply", applyCoupon);
router.post("/manage", manageCoupon);

export default router;
