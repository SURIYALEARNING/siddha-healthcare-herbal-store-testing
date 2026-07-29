import * as analyticsService from "../services/analyticsService.js";

export async function getOverview(req, res) {
  try {
    const { startDate, endDate } = req.query;
    const data = await analyticsService.getOverview(startDate, endDate);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch overview." });
  }
}

export async function getRevenueAnalytics(req, res) {
  try {
    const { startDate, endDate } = req.query;
    const data = await analyticsService.getRevenueAnalytics(startDate, endDate);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch revenue analytics." });
  }
}

export async function getOrderAnalytics(req, res) {
  try {
    const { startDate, endDate } = req.query;
    const data = await analyticsService.getOrderAnalytics(startDate, endDate);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch order analytics." });
  }
}

export async function getCustomerAnalytics(req, res) {
  try {
    const { startDate, endDate } = req.query;
    const data = await analyticsService.getCustomerAnalytics(startDate, endDate);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch customer analytics." });
  }
}

export async function getProductAnalytics(req, res) {
  try {
    const { startDate, endDate } = req.query;
    const data = await analyticsService.getProductAnalytics(startDate, endDate);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch product analytics." });
  }
}

export async function getCategoryAnalytics(req, res) {
  try {
    const { startDate, endDate } = req.query;
    const data = await analyticsService.getCategoryAnalytics(startDate, endDate);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch category analytics." });
  }
}

export async function getInventoryAnalytics(req, res) {
  try {
    const data = await analyticsService.getInventoryAnalytics();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch inventory analytics." });
  }
}

export async function getBatchAnalytics(req, res) {
  try {
    const data = await analyticsService.getBatchAnalytics();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch batch analytics." });
  }
}

export async function getReminderAnalytics(req, res) {
  try {
    const { startDate, endDate } = req.query;
    const data = await analyticsService.getReminderAnalytics(startDate, endDate);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch reminder analytics." });
  }
}

export async function getReviewAnalytics(req, res) {
  try {
    const { startDate, endDate } = req.query;
    const data = await analyticsService.getReviewAnalytics(startDate, endDate);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch review analytics." });
  }
}

export async function getPaymentAnalytics(req, res) {
  try {
    const { startDate, endDate } = req.query;
    const data = await analyticsService.getPaymentAnalytics(startDate, endDate);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch payment analytics." });
  }
}

export async function getShippingAnalytics(req, res) {
  try {
    const { startDate, endDate } = req.query;
    const data = await analyticsService.getShippingAnalytics(startDate, endDate);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch shipping analytics." });
  }
}

export async function getStaffAnalytics(req, res) {
  try {
    const data = await analyticsService.getStaffAnalytics();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch staff analytics." });
  }
}

export async function getRecentActivities(req, res) {
  try {
    const { limit } = req.query;
    const data = await analyticsService.getRecentActivities(Number(limit) || 20);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch recent activities." });
  }
}

export async function getNotifications(req, res) {
  try {
    const data = await analyticsService.getNotifications();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch notifications." });
  }
}
