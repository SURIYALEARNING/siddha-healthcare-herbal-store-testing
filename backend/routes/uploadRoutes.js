import express from "express";
import multer from "multer";
import { verifyAdmin } from "../Auth/authMiddleware.js";
import { uploadFiles, deleteMedia } from "../services/uploadService.js";
import Product from "../models/Product.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload-media", verifyAdmin, upload.array("files", 20), async (req, res) => {
  try {
    const results = await uploadFiles(req.files);
    res.status(200).json({ message: "Files uploaded successfully", media: results });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/delete-media", verifyAdmin, async (req, res) => {
  try {
    const { publicIds } = req.body;
    await deleteMedia(publicIds);
    res.status(200).json({ message: "Media deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete media" });
  }
});

export default router;
