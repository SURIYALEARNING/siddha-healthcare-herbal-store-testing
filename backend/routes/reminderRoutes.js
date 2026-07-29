import express from "express";
import {
  getAdminReminders, getReminderById, getTodayRemindersEndpoint,
  updateWhatsappStatus, completeCall, getReminderStats,
} from "../controllers/reminderController.js";
import { verifyAdmin } from "../Auth/authMiddleware.js";

const router = express.Router();

router.get("/", verifyAdmin, getAdminReminders);
router.get("/today", getTodayRemindersEndpoint);
router.get("/stats", verifyAdmin, getReminderStats);
router.get("/:id", verifyAdmin, getReminderById);
router.patch("/:id/whatsapp", updateWhatsappStatus);
router.patch("/:id/call", verifyAdmin, completeCall);

export default router;
