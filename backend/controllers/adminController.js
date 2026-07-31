import { buildAnalytics } from '../services/analyticsService.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { User } from '../models/User.js';
import Consultation from '../models/Consultation.js';
import { maybeCreateRemindersForOrder } from '../services/reminderService.js';
import { addTimelineEvent, addPaymentTimelineEvent } from '../services/timelineService.js';
import { ORDER_STATUSES, TERMINAL_STATUSES } from '../constants/orderStatus.js';

export async function getAdminOrders(req, res) {
  try {
    const {
      page = 1, limit = 50,
      status, paymentStatus, shippingMethod,
      search, dateFrom, dateTo,
      period, userId,
    } = req.query;

    const filter = {};

    if (status) filter.currentStatus = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (shippingMethod) filter.shippingMethod = shippingMethod;
    if (userId) filter.userId = userId;

    if (period === "today") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      filter.createdAt = { $gte: today, $lt: tomorrow };
    } else if (period === "yesterday") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      filter.createdAt = { $gte: yesterday, $lt: today };
    } else if (period === "last7") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      filter.createdAt = { $gte: sevenDaysAgo };
    } else if (period === "thisMonth") {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      filter.createdAt = { $gte: startOfMonth };
    } else if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    if (search) {
      const searchRegex = { $regex: search, $options: "i" };
      const matchingUsers = await User.find({
        $or: [{ fullName: searchRegex }, { mobileNumber: searchRegex }],
      }).select("_id").lean();
      const userIds = matchingUsers.map(u => u._id);
      filter.$or = [
        { fullName: searchRegex },
        { mobileNumber: searchRegex },
        { email: searchRegex },
        { _id: { $in: userIds } },
        { userId: { $in: userIds } },
      ];
    }

    const skip = (Math.max(1, Number(page)) - 1) * Math.min(100, Number(limit));
    const pageLimit = Math.min(100, Number(limit));

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .select("-timeline")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageLimit)
        .lean(),
      Order.countDocuments(filter),
    ]);

    res.json({ orders, total, page: Number(page), totalPages: Math.ceil(total / pageLimit) });
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    res.status(500).json({ error: "Failed to fetch orders." });
  }
}

export async function getOrderById(req, res) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found." });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch order." });
  }
}

export async function updateOrderStatus(req, res) {
  try {
    const { status, paymentStatus, description } = req.body;
    const orderId = req.params.id;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found." });

    const updateFields = {};
    if (paymentStatus) {
      updateFields.paymentStatus = paymentStatus;
      if (paymentStatus === "Paid" && order.paymentStatus !== "Paid") {
        await addPaymentTimelineEvent(orderId, "STAFF");
      }
    }

    if (status) {
      const isTerminal = TERMINAL_STATUSES.includes(status);
      if (!isTerminal && order.shippingMethod === "SHIPROCKET") {
        return res.status(400).json({
          error: "Shiprocket orders cannot be manually updated. Use the shipping workflow or wait for Shiprocket updates.",
        });
      }

      updateFields.status = status;
      updateFields.currentStatus = status;

      const event = await addTimelineEvent({
        orderId,
        status,
        description: description || undefined,
        updatedBy: req.user?.id || "STAFF",
        source: "STAFF",
      });

      if (status === ORDER_STATUSES.DELIVERED) {
        updateFields["tracking.deliveredAt"] = new Date();
        maybeCreateRemindersForOrder(orderId).catch((err) =>
          console.error("Failed to create delivery reminders:", err)
        );
      }
    }

    const updated = await Order.findByIdAndUpdate(orderId, { $set: updateFields }, { new: true });
    res.json({ message: "Order status updated!", order: updated });
  } catch (error) {
    console.error("Failed to update order status:", error);
    res.status(500).json({ error: "Failed to update order status." });
  }
}

export async function updateManualShippingStatus(req, res) {
  try {
    const { status, description } = req.body;
    const orderId = req.params.id;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found." });
    if (order.shippingMethod !== "MANUAL") {
      return res.status(400).json({ error: "Only manual shipping orders can use this endpoint." });
    }

    const event = await addTimelineEvent({
      orderId,
      status,
      description: description || undefined,
      updatedBy: req.user?.id || "STAFF",
      source: "STAFF",
    });

    if (status === ORDER_STATUSES.DELIVERED) {
      maybeCreateRemindersForOrder(orderId).catch((err) =>
        console.error("Failed to create delivery reminders:", err)
      );
    }

    const updated = await Order.findByIdAndUpdate(
      orderId,
      { $set: { status, currentStatus: status } },
      { new: true }
    );
    res.json({ message: "Shipping status updated!", order: updated });
  } catch (error) {
    res.status(500).json({ error: "Failed to update shipping status." });
  }
}

export async function getOrderTimeline(req, res) {
  try {
    const order = await Order.findById(req.params.id).select("timeline currentStatus").lean();
    if (!order) return res.status(404).json({ error: "Order not found." });
    res.json({ timeline: order.timeline || [], currentStatus: order.currentStatus });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch timeline." });
  }
}

export async function getOrderStats(req, res) {
  try {
    const allOrders = await Order.find().select("currentStatus createdAt paymentStatus").lean();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = allOrders.filter(o => o.createdAt && new Date(o.createdAt) >= today);

    const countByStatus = {};
    for (const s of Object.values(ORDER_STATUSES)) {
      countByStatus[s] = 0;
    }
    for (const o of allOrders) {
      const status = o.currentStatus || ORDER_STATUSES.PENDING;
      countByStatus[status] = (countByStatus[status] || 0) + 1;
    }

    res.json({
      today: todayOrders.length,
      ...countByStatus,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch order stats." });
  }
}

export async function getCustomerOrders(req, res) {
  try {
    const { userId } = req.params;
    const { status } = req.query;

    const filter = { userId };
    if (status) filter.currentStatus = status;

    const orders = await Order.find(filter)
      .select("-timeline")
      .sort({ createdAt: -1 })
      .lean();

    const user = await User.findById(userId).select("-password").lean();
    const customerInfo = user ? {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      mobileNumber: user.mobileNumber,
      address: user.address,
      totalOrders: orders.length,
      totalSpent: orders.reduce((sum, o) => sum + o.total, 0),
    } : null;

    res.json({ customer: customerInfo, orders });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch customer orders." });
  }
}

export async function getCustomersList(req, res) {
  try {
    const users = await User.find().lean();
    const orders = await Order.find().select("userId total currentStatus createdAt").lean();

    const customersList = users.map(u => {
      const userOrders = orders.filter(o => o.userId?.toString() === u._id.toString());
      const lastOrder = userOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
      return {
        id: u._id,
        fullName: u.fullName,
        email: u.email,
        mobileNumber: u.mobileNumber,
        isAdmin: u.isAdmin,
        totalOrders: userOrders.length,
        totalSpent: userOrders.reduce((sum, o) => sum + o.total, 0),
        lastOrderDate: lastOrder?.createdAt || null,
      };
    });

    customersList.sort((a, b) => b.totalSpent - a.totalSpent);
    res.json(customersList);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch customers." });
  }
}

export async function trackOrder(req, res) {
  try {
    const order = await Order.findById(req.params.id).lean();
    if (!order) return res.status(404).json({ error: "Order with this ID was not retrieved." });

    let trackingHistory = [];
    if (order.shiprocketDetails?.shipmentId) {
      try {
        const { default: shiprocket } = await import('../services/shiprocket.service.js');
        const data = await shiprocket.trackShipment(order.shiprocketDetails.shipmentId);
        const tracking = data?.tracking_data || {};
        trackingHistory = tracking.history || [];

        if (order.awbCode) {
          order.tracking = {
            ...(order.tracking || {}),
            courierName: order.courierName || tracking.courier_name || "",
            awbNumber: order.awbCode,
            estimatedDelivery: tracking.etd || order.tracking?.estimatedDelivery,
            currentStatus: tracking.status || order.tracking?.currentStatus,
          };
        }
      } catch {
        // tracking fetch is best-effort
      }
    }

    res.json({ ...order, trackingHistory });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch order." });
  }
}

export async function getAdminUsers(req, res) {
  try {
    const users = await User.find();
    const orders = await Order.find();
    const customersList = users.map(u => {
      const userOrders = orders.filter(o => o.userId.toString() === u._id.toString());
      const totalSpent = userOrders.reduce((sum, o) => sum + o.total, 0);
      return {
        id: u._id,
        fullName: u.fullName,
        email: u.email,
        mobileNumber: u.mobileNumber,
        isAdmin: u.isAdmin,
        totalSpent
      };
    });
    res.json(customersList);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users." });
  }
}

export async function getAdminAnalytics(req, res) {
  try {
    const [orders, products, users, consultations] = await Promise.all([
      Order.find(),
      Product.find(),
      User.find(),
      Consultation.find(),
    ]);
    const analytics = buildAnalytics(orders, products, users, consultations);
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch analytics." });
  }
}
