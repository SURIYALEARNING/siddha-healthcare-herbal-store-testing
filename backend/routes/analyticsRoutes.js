import express from "express";
import { verifyAdmin } from "../Auth/authMiddleware.js";
import { requirePermission } from "../Auth/permissionMiddleware.js";
import * as analyticsController from "../controllers/analyticsController.js";

const router = express.Router();

router.use(verifyAdmin);

router.get("/overview", analyticsController.getOverview);
router.get("/revenue", requirePermission("dashboard"), analyticsController.getRevenueAnalytics);
router.get("/orders", requirePermission("dashboard"), analyticsController.getOrderAnalytics);
router.get("/customers", requirePermission("dashboard"), analyticsController.getCustomerAnalytics);
router.get("/products", requirePermission("products"), analyticsController.getProductAnalytics);
router.get("/categories", requirePermission("categories"), analyticsController.getCategoryAnalytics);
router.get("/inventory", analyticsController.getInventoryAnalytics);
router.get("/batches", requirePermission("batches"), analyticsController.getBatchAnalytics);
router.get("/reminders", requirePermission("reminders"), analyticsController.getReminderAnalytics);
router.get("/reviews", requirePermission("reviews"), analyticsController.getReviewAnalytics);
router.get("/payments", analyticsController.getPaymentAnalytics);
router.get("/shipping", requirePermission("shipping"), analyticsController.getShippingAnalytics);
router.get("/staff", requirePermission("staffManagement"), analyticsController.getStaffAnalytics);
router.get("/activities", analyticsController.getRecentActivities);
router.get("/notifications", analyticsController.getNotifications);

export default router;
