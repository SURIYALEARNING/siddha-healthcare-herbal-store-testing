import express from "express";
import {
  getBatches, getBatchById, createBatch, updateBatch,
  adjustStock, getStockHistory,
} from "../controllers/batchController.js";
import { verifyAdmin } from "../Auth/authMiddleware.js";

const router = express.Router();

router.get("/", verifyAdmin, getBatches);
router.get("/:id", verifyAdmin, getBatchById);
router.post("/", verifyAdmin, createBatch);
router.put("/:id", verifyAdmin, updateBatch);
router.patch("/:id/stock-adjustment", verifyAdmin, adjustStock);
router.get("/:id/history", verifyAdmin, getStockHistory);

export default router;
