import { Router } from "express";
import {
  getProducts,
  getProductBySlug,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productV2Controller.js";
import { verifyToken, verifyAdmin } from "../Auth/authMiddleware.js";

const router = Router();

router.get("/", getProducts);
router.get("/by-id/:id", getProductById);
router.get("/:slug", getProductBySlug);
router.post("/", verifyToken, verifyAdmin, createProduct);
router.put("/:id", verifyToken, verifyAdmin, updateProduct);
router.delete("/:id", verifyToken, verifyAdmin, deleteProduct);

export default router;
