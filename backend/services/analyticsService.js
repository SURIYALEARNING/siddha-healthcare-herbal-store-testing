import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { User } from "../models/User.js";
import Batch from "../models/Batch.js";
import Reminder from "../models/Reminder.js";
import Review from "../models/Review.js";
import Category from "../models/Category.js";
import Shipment from "../models/Shipment.js";

function dateFilter(startDate, endDate) {
  const filter = {};
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = end;
    }
  }
  return filter;
}

function prevDateFilter(startDate, endDate) {
  if (!startDate && !endDate) return {};
  const now = new Date();
  const end = endDate ? new Date(endDate) : new Date(now);
  const start = startDate ? new Date(startDate) : new Date(now);
  const range = end.getTime() - start.getTime();
  const prevStart = new Date(start.getTime() - range);
  const prevEnd = new Date(end.getTime() - range);
  return { startDate: prevStart.toISOString(), endDate: prevEnd.toISOString() };
}

export async function getOverview(startDate, endDate) {
  const df = dateFilter(startDate, endDate);
  const pdf = prevDateFilter(startDate, endDate);
  const pdfFilter = dateFilter(pdf.startDate, pdf.endDate);

  const [orders, prevOrders, products, users, batches, reminders, reviews, categories] = await Promise.all([
    Order.find(df).lean(),
    Order.find(pdfFilter).lean(),
    Product.find().lean(),
    User.find().lean(),
    Batch.find().lean(),
    Reminder.find(df).lean(),
    Review.find(df).lean(),
    Category.countDocuments(),
  ]);

  const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);
  const prevRevenue = prevOrders.reduce((s, o) => s + (o.total || 0), 0);
  const totalOrders = orders.length;
  const prevTotalOrders = prevOrders.length;
  const customers = users.filter((u) => !u.isAdmin);
  const totalCustomers = customers.length;
  const totalProducts = products.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const prevAvgOrderValue = prevTotalOrders > 0 ? prevRevenue / prevTotalOrders : 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayEnd = new Date(today);
  todayEnd.setHours(23, 59, 59, 999);
  const todayOrders = orders.filter((o) => o.createdAt && new Date(o.createdAt) >= today && new Date(o.createdAt) <= todayEnd);
  const todayRevenue = todayOrders.reduce((s, o) => s + (o.total || 0), 0);

  const pendingOrders = orders.filter((o) => o.status === "Ordered" || o.shippingStatus === "PAID" || o.shippingStatus === "CONFIRMED");
  const deliveredOrders = orders.filter((o) => o.status === "Delivered" || o.shippingStatus === "DELIVERED");
  const cancelledOrders = orders.filter((o) => o.status === "Cancelled" || o.shippingStatus === "CANCELLED");

  const lowStock = batches.filter((b) => b.status === "ACTIVE" && b.currentStock > 0 && b.currentStock <= 5);
  const outOfStock = batches.filter((b) => b.status === "OUT_OF_STOCK");
  const expired = batches.filter((b) => b.status === "EXPIRED" || (b.expiryDate && new Date(b.expiryDate) < new Date()));
  const pendingReminders = reminders.filter((r) => r.status === "PENDING");
  const pendingReviews = reviews.filter((r) => !r.isApproved);

  const pct = (cur, prev) => (prev > 0 ? ((cur - prev) / prev) * 100 : cur > 0 ? 100 : 0);

  return {
    totalRevenue,
    totalOrders,
    totalCustomers,
    totalProducts,
    totalCategories: categories,
    averageOrderValue: Math.round(avgOrderValue),
    todayRevenue,
    todayOrders: todayOrders.length,
    pendingOrders: pendingOrders.length,
    deliveredOrders: deliveredOrders.length,
    cancelledOrders: cancelledOrders.length,
    lowStockProducts: lowStock.length,
    outOfStockProducts: outOfStock.length,
    expiredBatches: expired.length,
    pendingReminders: pendingReminders.length,
    pendingReviews: pendingReviews.length,
    growth: {
      revenue: Math.round(pct(totalRevenue, prevRevenue) * 100) / 100,
      orders: Math.round(pct(totalOrders, prevTotalOrders) * 100) / 100,
      avgOrderValue: Math.round(pct(avgOrderValue, prevAvgOrderValue) * 100) / 100,
    },
  };
}

export async function getRevenueAnalytics(startDate, endDate) {
  const df = dateFilter(startDate, endDate);
  const orders = await Order.find(df).lean();

  const grossRevenue = orders.reduce((s, o) => s + (o.subtotal || 0), 0);
  const discountAmount = orders.reduce((s, o) => s + (o.couponDiscount || 0), 0);
  const netRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);

  // Daily revenue for chart
  const dailyMap = {};
  orders.forEach((o) => {
    const d = o.createdAt ? new Date(o.createdAt).toISOString().split("T")[0] : "unknown";
    if (!dailyMap[d]) dailyMap[d] = { date: d, revenue: 0, orders: 0 };
    dailyMap[d].revenue += o.total || 0;
    dailyMap[d].orders += 1;
  });
  const dailyRevenue = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));

  return {
    grossRevenue: Math.round(grossRevenue),
    discountAmount: Math.round(discountAmount),
    netRevenue: Math.round(netRevenue),
    dailyRevenue,
  };
}

export async function getOrderAnalytics(startDate, endDate) {
  const df = dateFilter(startDate, endDate);
  const orders = await Order.find(df).lean();

  const statusCounts = { Ordered: 0, Shipped: 0, Delivered: 0, Cancelled: 0 };
  const paymentMethods = { COD: 0, Online: 0, UPI: 0, Card: 0, Wallet: 0 };

  orders.forEach((o) => {
    if (statusCounts[o.status] !== undefined) statusCounts[o.status]++;
    const pm = (o.paymentMethod || "").toUpperCase();
    if (pm.includes("COD")) paymentMethods.COD++;
    else if (pm.includes("UPI")) paymentMethods.UPI++;
    else if (pm.includes("CARD")) paymentMethods.Card++;
    else if (pm.includes("WALLET")) paymentMethods.Wallet++;
    else paymentMethods.Online++;
  });

  // Orders by day for trend
  const dayMap = {};
  orders.forEach((o) => {
    const d = o.createdAt ? new Date(o.createdAt).toISOString().split("T")[0] : "unknown";
    if (!dayMap[d]) dayMap[d] = { date: d, count: 0 };
    dayMap[d].count++;
  });
  const ordersByDay = Object.values(dayMap).sort((a, b) => a.date.localeCompare(b.date));

  return {
    totalOrders: orders.length,
    completedOrders: statusCounts.Delivered,
    pendingOrders: statusCounts.Ordered,
    cancelledOrders: statusCounts.Cancelled,
    shippedOrders: statusCounts.Shipped,
    orderStatusChart: Object.entries(statusCounts).map(([name, value]) => ({ name, value })),
    paymentMethodChart: Object.entries(paymentMethods).filter(([_, v]) => v > 0).map(([name, value]) => ({ name, value })),
    ordersByDay,
  };
}

export async function getCustomerAnalytics(startDate, endDate) {
  const df = dateFilter(startDate, endDate);
  const pdf = prevDateFilter(startDate, endDate);
  const pdfFilter = dateFilter(pdf.startDate, pdf.endDate);

  const [orders, prevOrders, allUsers] = await Promise.all([
    Order.find(df).lean(),
    Order.find(pdfFilter).lean(),
    User.find().lean(),
  ]);

  // Unique customers in period
  const customerIds = new Set(orders.map((o) => o.userId?.toString()).filter(Boolean));
  const prevCustomerIds = new Set(prevOrders.map((o) => o.userId?.toString()).filter(Boolean));

  // New customers (in current but not in previous)
  const newCustomers = [...customerIds].filter((id) => !prevCustomerIds.has(id));

  // Customer order frequency
  const customerOrderCount = {};
  orders.forEach((o) => {
    const uid = o.userId?.toString();
    if (uid) customerOrderCount[uid] = (customerOrderCount[uid] || 0) + 1;
  });
  const returningCustomers = Object.values(customerOrderCount).filter((c) => c > 1).length;
  const repeatRate = customerIds.size > 0 ? (returningCustomers / customerIds.size) * 100 : 0;

  // Customer lifetime value (all time)
  const allOrders = await Order.find().lean();
  const customerLTV = {};
  allOrders.forEach((o) => {
    const uid = o.userId?.toString();
    if (uid) customerLTV[uid] = (customerLTV[uid] || 0) + (o.total || 0);
  });
  const avgLTV = Object.keys(customerLTV).length > 0
    ? Object.values(customerLTV).reduce((s, v) => s + v, 0) / Object.keys(customerLTV).length : 0;

  // Top customers
  const customerMap = {};
  allUsers.forEach((u) => { customerMap[u._id.toString()] = u; });
  const topCustomers = [...customerIds].map((id) => ({
    id,
    fullName: customerMap[id]?.fullName || "Unknown",
    email: customerMap[id]?.email || "",
    mobileNumber: customerMap[id]?.mobileNumber || "",
    totalOrders: customerOrderCount[id] || 0,
    totalSpent: customerLTV[id] || 0,
  })).sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 10);

  // Registration trend
  const regMap = {};
  allUsers.forEach((u) => {
    if (!u.isAdmin && u.createdAt) {
      const d = new Date(u.createdAt).toISOString().split("T")[0];
      if (!regMap[d]) regMap[d] = 0;
      regMap[d]++;
    }
  });
  const registrationTrend = Object.entries(regMap).sort((a, b) => a[0].localeCompare(b[0])).map(([date, count]) => ({ date, count }));

  return {
    totalCustomers: allUsers.filter((u) => !u.isAdmin).length,
    newCustomers: newCustomers.length,
    returningCustomers,
    repeatPurchaseRate: Math.round(repeatRate * 100) / 100,
    customerLifetimeValue: Math.round(avgLTV),
    topCustomers,
    registrationTrend,
  };
}

export async function getProductAnalytics(startDate, endDate) {
  const df = dateFilter(startDate, endDate);
  const orders = await Order.find(df).lean();
  const products = await Product.find().lean();

  const productMap = {};
  products.forEach((p) => { productMap[p._id.toString()] = p; });

  const salesMap = {};
  orders.forEach((o) => {
    (o.items || []).forEach((item) => {
      const pid = item.productId?.toString();
      if (!pid) return;
      if (!salesMap[pid]) salesMap[pid] = { productId: pid, name: item.name, orders: 0, quantitySold: 0, revenue: 0 };
      salesMap[pid].orders++;
      salesMap[pid].quantitySold += item.quantity || 0;
      salesMap[pid].revenue += (item.quantity || 0) * (item.price || 0);
    });
  });

  const sorted = Object.values(salesMap).sort((a, b) => b.revenue - a.revenue);

  return {
    topSelling: sorted.slice(0, 10),
    leastSelling: sorted.slice(-10).reverse(),
    totalProducts: products.length,
    productsWithSales: Object.keys(salesMap).length,
    productsNeverSold: products.filter((p) => !salesMap[p._id.toString()]).length,
  };
}

function resolveCategory(cat) {
  if (!cat) return { id: "uncategorized", name: "Uncategorized" };
  if (typeof cat === "object") {
    const id = cat._id?.toString?.() || cat.toString?.() || "uncategorized";
    const name = cat.name?.en || cat.name || "Uncategorized";
    return { id, name };
  }
  return { id: cat.toString?.() || "uncategorized", name: "Uncategorized" };
}

export async function getCategoryAnalytics(startDate, endDate) {
  const df = dateFilter(startDate, endDate);
  const orders = await Order.find(df).lean();
  const products = await Product.find().lean();

  const catMap = {};
  products.forEach((p) => {
    const { id, name } = resolveCategory(p.category);
    if (!catMap[id]) catMap[id] = { id, name, sales: 0, revenue: 0, orders: 0 };
  });

  orders.forEach((o) => {
    (o.items || []).forEach((item) => {
      const prod = products.find((p) => p._id.toString() === item.productId?.toString());
      if (!prod) return;
      const { id } = resolveCategory(prod.category);
      if (!catMap[id]) return;
      catMap[id].sales += item.quantity || 0;
      catMap[id].revenue += (item.quantity || 0) * (item.price || 0);
      catMap[id].orders++;
    });
  });

  const categories = Object.values(catMap).sort((a, b) => b.revenue - a.revenue);
  return { categories, totalCategories: categories.length };
}

export async function getInventoryAnalytics() {
  const [batches, orders] = await Promise.all([
    Batch.find().lean(),
    Order.find().lean(),
  ]);

  const totalStock = batches.reduce((s, b) => s + (b.currentStock || 0), 0);
  const lowStock = batches.filter((b) => b.status === "ACTIVE" && b.currentStock > 0 && b.currentStock <= 5);
  const outOfStock = batches.filter((b) => b.status === "OUT_OF_STOCK" || (b.status === "ACTIVE" && b.currentStock === 0));

  // Stock movement
  const totalSold = orders.reduce((s, o) => s + o.items.reduce((s2, i) => s2 + (i.quantity || 0), 0), 0);
  const totalProduced = batches.reduce((s, b) => s + (b.quantityProduced || 0), 0);

  return {
    totalStockQuantity: totalStock,
    lowStockCount: lowStock.length,
    outOfStockCount: outOfStock.length,
    totalProduced,
    totalSold,
  };
}

export async function getBatchAnalytics() {
  const batches = await Batch.find().populate("productId", "name").lean();
  const now = new Date();

  const active = batches.filter((b) => b.status === "ACTIVE" && b.currentStock > 0);
  const outOfStock = batches.filter((b) => b.status === "OUT_OF_STOCK" || (b.status === "ACTIVE" && b.currentStock === 0));
  const expired = batches.filter((b) => b.status === "EXPIRED" || (b.expiryDate && new Date(b.expiryDate) < now));
  const hold = batches.filter((b) => b.status === "HOLD");

  const statusChart = [
    { name: "Active", value: active.length },
    { name: "Out of Stock", value: outOfStock.length },
    { name: "Expired", value: expired.length },
    { name: "Hold", value: hold.length },
  ].filter((s) => s.value > 0);

  return {
    activeBatches: active.length,
    outOfStockBatches: outOfStock.length,
    expiredBatches: expired.length,
    holdBatches: hold.length,
    statusChart,
    batches: batches.map((b) => ({
      batchNumber: b.batchNumber,
      product: b.productId?.name?.en || "Unknown",
      quantityProduced: b.quantityProduced,
      currentStock: b.currentStock,
      expiryDate: b.expiryDate,
      status: b.status,
    })),
  };
}

export async function getReminderAnalytics(startDate, endDate) {
  const df = dateFilter(startDate, endDate);
  const reminders = await Reminder.find(df).lean();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayReminders = reminders.filter(
    (r) => new Date(r.reminderDate) >= today && new Date(r.reminderDate) < tomorrow
  );
  const pending = reminders.filter((r) => r.status === "PENDING");
  const whatsappSent = reminders.filter((r) => r.whatsappStatus === "SENT");
  const callPending = reminders.filter((r) => r.status === "CALL_PENDING");
  const callCompleted = reminders.filter((r) => r.status === "CALL_COMPLETED");
  const purchasedAgain = reminders.filter((r) => r.status === "PURCHASED_AGAIN");
  const notInterested = reminders.filter((r) => r.callStatus === "NOT_INTERESTED");
  const noResponse = reminders.filter((r) => r.callStatus === "NO_RESPONSE");

  // Trend
  const trendMap = {};
  reminders.forEach((r) => {
    if (r.createdAt) {
      const d = new Date(r.createdAt).toISOString().split("T")[0];
      if (!trendMap[d]) trendMap[d] = { date: d, count: 0 };
      trendMap[d].count++;
    }
  });
  const reminderTrend = Object.values(trendMap).sort((a, b) => a.date.localeCompare(b.date));

  return {
    todayReminders: todayReminders.length,
    pendingReminders: pending.length,
    whatsappSent: whatsappSent.length,
    callPending: callPending.length,
    callCompleted: callCompleted.length,
    purchasedAgain: purchasedAgain.length,
    notInterested: notInterested.length,
    noResponse: noResponse.length,
    reminderTrend,
    conversionRate: reminders.length > 0
      ? Math.round((purchasedAgain.length / reminders.length) * 10000) / 100 : 0,
  };
}

export async function getReviewAnalytics(startDate, endDate) {
  const df = dateFilter(startDate, endDate);
  const reviews = await Review.find(df).lean();

  const total = reviews.length;
  const approved = reviews.filter((r) => r.isApproved).length;
  const pending = total - approved;
  const avgRating = total > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0;

  const ratingDist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach((r) => { if (ratingDist[r.rating] !== undefined) ratingDist[r.rating]++; });
  const ratingChart = Object.entries(ratingDist).map(([rating, count]) => ({ rating: Number(rating), count }));

  // Trend
  const trendMap = {};
  reviews.forEach((r) => {
    if (r.createdAt) {
      const d = new Date(r.createdAt).toISOString().split("T")[0];
      if (!trendMap[d]) trendMap[d] = { date: d, count: 0 };
      trendMap[d].count++;
    }
  });
  const reviewTrend = Object.values(trendMap).sort((a, b) => a.date.localeCompare(b.date));

  return {
    totalReviews: total,
    pendingReviews: pending,
    approvedReviews: approved,
    averageRating: Math.round(avgRating * 10) / 10,
    ratingChart,
    reviewTrend,
  };
}

export async function getPaymentAnalytics(startDate, endDate) {
  const df = dateFilter(startDate, endDate);
  const orders = await Order.find(df).lean();

  const successful = orders.filter((o) => o.paymentStatus === "Paid" || o.paymentStatus === "paid");
  const failed = orders.filter((o) => o.paymentStatus === "Failed" || o.paymentStatus === "failed");
  const refundAmount = 0; // No refund tracking yet

  const methodMap = {};
  orders.forEach((o) => {
    const pm = o.paymentMethod || "Unknown";
    methodMap[pm] = (methodMap[pm] || 0) + 1;
  });
  const methodChart = Object.entries(methodMap).map(([name, value]) => ({ name, value }));

  return {
    successfulPayments: successful.length,
    failedPayments: failed.length,
    refundAmount,
    paymentMethodChart: methodChart,
  };
}

export async function getShippingAnalytics(startDate, endDate) {
  const df = dateFilter(startDate, endDate);
  const orders = await Order.find(df).lean();

  const delivered = orders.filter((o) => o.shippingStatus === "DELIVERED" || o.status === "Delivered");
  const inTransit = orders.filter((o) =>
    ["PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY"].includes(o.shippingStatus)
  );
  const rto = orders.filter((o) => o.shippingStatus === "RETURNED");
  const cancelled = orders.filter((o) => o.shippingStatus === "CANCELLED");

  return {
    deliveredOrders: delivered.length,
    inTransitOrders: inTransit.length,
    rtoOrders: rto.length,
    cancelledShipments: cancelled.length,
  };
}

export async function getStaffAnalytics() {
  const staff = await User.find({ role: "STAFF" }).lean();
  const activeStaff = staff.filter((s) => s.isActive !== false);

  return {
    totalStaff: staff.length,
    activeStaff: activeStaff.length,
    staff,
  };
}

export async function getRecentActivities(limit = 20) {
  const [recentOrders, recentUsers, recentReviews, recentBatches] = await Promise.all([
    Order.find().sort({ createdAt: -1 }).limit(5).select("fullName total status createdAt").lean(),
    User.find({ isAdmin: { $ne: true } }).sort({ createdAt: -1 }).limit(5).select("fullName createdAt").lean(),
    Review.find().sort({ createdAt: -1 }).limit(5).select("userName rating createdAt").lean(),
    Batch.find().sort({ createdAt: -1 }).limit(5).select("batchNumber productId status createdAt").lean(),
  ]);

  const activities = [
    ...recentOrders.map((o) => ({
      type: "order",
      message: `New order from ${o.fullName}`,
      detail: `₹${o.total} • ${o.status}`,
      time: o.createdAt,
    })),
    ...recentUsers.map((u) => ({
      type: "customer",
      message: `New customer registered`,
      detail: u.fullName,
      time: u.createdAt,
    })),
    ...recentReviews.map((r) => ({
      type: "review",
      message: `${r.userName} left a review`,
      detail: `${r.rating} stars`,
      time: r.createdAt,
    })),
    ...recentBatches.map((b) => ({
      type: "batch",
      message: `Batch ${b.batchNumber} created`,
      detail: b.status,
      time: b.createdAt,
    })),
  ]
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .slice(0, limit);

  return activities;
}

export async function getNotifications() {
  const now = new Date();

  const [lowStockBatches, expiredBatches, pendingReviews, pendingReminders, failedOrders] = await Promise.all([
    Batch.find({ status: "ACTIVE", currentStock: { $gt: 0, $lte: 5 } }).countDocuments(),
    Batch.find({ $or: [{ status: "EXPIRED" }, { expiryDate: { $lt: now } }] }).countDocuments(),
    Review.find({ isApproved: false }).countDocuments(),
    Reminder.find({ status: "PENDING", reminderDate: { $lte: now } }).countDocuments(),
    Order.find({ paymentStatus: "Failed" }).countDocuments(),
  ]);

  const notifications = [];
  if (lowStockBatches > 0) notifications.push({ type: "low_stock", message: `${lowStockBatches} batches have low stock`, severity: "warning" });
  if (expiredBatches > 0) notifications.push({ type: "expired_batch", message: `${expiredBatches} batches are expired`, severity: "error" });
  if (pendingReviews > 0) notifications.push({ type: "pending_review", message: `${pendingReviews} reviews pending approval`, severity: "info" });
  if (pendingReminders > 0) notifications.push({ type: "pending_reminder", message: `${pendingReminders} reminders are due`, severity: "warning" });
  if (failedOrders > 0) notifications.push({ type: "failed_payment", message: `${failedOrders} failed payments`, severity: "error" });

  return notifications;
}

// Legacy backward-compatible analytics
export function buildAnalytics(orders, products, users, consultations) {
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const totalCustomers = users.filter(u => !u.isAdmin).length;
  const productSalesMap = {};
  orders.forEach(o => {
    (o.items || []).forEach(item => {
      const pid = item.productId ? item.productId.toString() : item.productId;
      if (!productSalesMap[pid]) productSalesMap[pid] = { name: item.name, quantity: 0, revenue: 0 };
      productSalesMap[pid].quantity += item.quantity || 0;
      productSalesMap[pid].revenue += (item.quantity || 0) * (item.price || 0);
    });
  });
  const topProducts = Object.keys(productSalesMap).map(id => ({ id, ...productSalesMap[id] })).sort((a, b) => b.quantity - a.quantity);
  const categorySales = {};
  orders.forEach(o => {
    (o.items || []).forEach(item => {
      const prod = products.find(p => { const pid = p._id ? p._id.toString() : p.id; const itemPid = item.productId ? item.productId.toString() : item.productId; return pid === itemPid; });
      const cat = prod ? prod.category : "Herbal Care";
      categorySales[cat] = (categorySales[cat] || 0) + ((item.quantity || 0) * (item.price || 0));
    });
  });
  const categoryData = Object.keys(categorySales).map(cat => ({ name: cat, value: categorySales[cat] }));
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyMap = {};
  orders.forEach(o => {
    const d = o.createdAt ? new Date(o.createdAt) : new Date();
    const key = monthNames[d.getMonth()];
    if (!monthlyMap[key]) monthlyMap[key] = { revenue: 0, count: 0 };
    monthlyMap[key].revenue += o.total || 0;
    monthlyMap[key].count += 1;
  });
  const monthlyRevenue = monthNames.filter(m => monthlyMap[m]).map(m => ({ name: m, revenue: monthlyMap[m].revenue, orders: monthlyMap[m].count }));
  return { totalRevenue, totalOrders, totalCustomers, topProducts: topProducts.slice(0, 5), categoryData, monthlyRevenue, bookingCount: consultations.length };
}
