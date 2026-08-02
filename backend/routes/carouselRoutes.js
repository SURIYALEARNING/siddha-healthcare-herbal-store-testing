import express from "express";
import { getCarouselProducts, updateCarouselProducts, updateSocialProducts } from "../controllers/carouselController.js";
import { verifyAdmin } from "../Auth/authMiddleware.js";

const router = express.Router();

router.get("/", getCarouselProducts);
router.put("/manage", verifyAdmin, updateCarouselProducts);
router.put("/manage/social", verifyAdmin, updateSocialProducts);

export default router;
