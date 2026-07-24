import express from "express";
import { verifyAdmin } from "../Auth/authMiddleware.js";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

const router = express.Router();

router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.post("/manage", verifyAdmin, createProduct);
router.put("/manage/:id", verifyAdmin, updateProduct);
router.delete("/manage/:id", verifyAdmin, deleteProduct);

export default router;
