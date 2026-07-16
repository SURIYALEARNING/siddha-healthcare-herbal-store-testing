import state from '../data/index.js';
import { getLoggedUser } from '../services/authHelper.js';
import { buildAnalytics } from '../services/analyticsService.js';

export function getAdminOrders(req, res) {
  const user = getLoggedUser(req);
  if (!user || !user.isAdmin) return res.status(403).json({ error: "Admin authorization restricted." });
  res.json(state.orders);
}

export function updateOrderStatus(req, res) {
  const user = getLoggedUser(req);
  if (!user || !user.isAdmin) return res.status(403).json({ error: "Admin privilege required." });

  const order = state.orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: "Order details not found." });

  const { status, paymentStatus } = req.body;
  if (status) order.status = status;
  if (paymentStatus) order.paymentStatus = paymentStatus;

  res.json({ message: "Order status modified!", order });
}

export function trackOrder(req, res) {
  const order = state.orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: "Order with this ID was not retrieved." });
  res.json(order);
}

export function getAdminUsers(req, res) {
  const user = getLoggedUser(req);
  if (!user || !user.isAdmin) return res.status(403).json({ error: "Admin access forbidden." });

  const customersList = state.users.map(u => {
    const userOrders = state.orders.filter(o => o.userId === u.id);
    const totalSpent = userOrders.reduce((sum, o) => sum + o.total, 0);
    return {
      id: u.id,
      fullName: u.fullName,
      email: u.email,
      mobileNumber: u.mobileNumber,
      isAdmin: u.isAdmin,
      totalSpent
    };
  });
  res.json(customersList);
}

export function getAdminAnalytics(req, res) {
  const user = getLoggedUser(req);
  if (!user || !user.isAdmin) return res.status(403).json({ error: "Unauthorized access forbidden." });

  const analytics = buildAnalytics(state.orders, state.products, state.users, state.consultations);
  res.json(analytics);
}
