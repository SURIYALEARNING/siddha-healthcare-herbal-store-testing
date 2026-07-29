import express from "express";
import { verifyAdmin } from "../Auth/authMiddleware.js";
import { requirePermission } from "../Auth/permissionMiddleware.js";
import {
  getStaffList, getStaffById, createStaff,
  updateStaff, updateStaffStatus, resetPassword, deleteStaff,
} from "../controllers/staffController.js";

const router = express.Router();

router.use(verifyAdmin);
router.use(requirePermission("staffManagement"));

router.get("/", getStaffList);
router.get("/:id", getStaffById);
router.post("/", createStaff);
router.put("/:id", updateStaff);
router.patch("/:id/status", updateStaffStatus);
router.patch("/:id/password", resetPassword);
router.delete("/:id", deleteStaff);

export default router;
