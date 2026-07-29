import { buildAnalytics } from '../services/analyticsService.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { User } from '../models/User.js';
import Consultation from '../models/Consultation.js';
import { maybeCreateRemindersForOrder } from '../services/reminderService.js';

export async function getAdminOrders(req, res) {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch orders." });
  }
}

export async function updateOrderStatus(req, res) {
  try {
    const { status, paymentStatus } = req.body;
    const updateFields = {};
    if (status) updateFields.status = status;
    if (paymentStatus) updateFields.paymentStatus = paymentStatus;

    const order = await Order.findByIdAndUpdate(req.params.id, { $set: updateFields }, { new: true });
    if (!order) return res.status(404).json({ error: "Order details not found." });

    const becameDelivered =
      (status === "Delivered" || updateFields.shippingStatus === "DELIVERED");
    if (becameDelivered) {
      maybeCreateRemindersForOrder(order._id).catch((err) =>
        console.error("Failed to create delivery reminders:", err)
      );
    }

    res.json({ message: "Order status modified!", order });
  } catch (error) {
    res.status(500).json({ error: "Failed to update order status." });
  }
}

export async function trackOrder(req, res) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order with this ID was not retrieved." });
    res.json(order);
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
