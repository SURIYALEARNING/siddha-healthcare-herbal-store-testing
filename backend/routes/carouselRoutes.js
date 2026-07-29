import express from "express";
import { getCarouselProducts, updateCarouselProducts } from "../controllers/carouselController.js";
import { verifyAdmin } from "../Auth/authMiddleware.js";

const router = express.Router();

router.get("/", getCarouselProducts);
router.put("/manage", verifyAdmin, updateCarouselProducts);

export default router;
