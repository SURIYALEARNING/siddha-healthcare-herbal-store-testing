import Reminder from "../models/Reminder.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import { User } from "../models/User.js";

const ACTIVE_STATUSES = ["PENDING", "WHATSAPP_SENT", "CALL_PENDING"];

function computeReminderDate(fromDate, reminderDays, quantity) {
  const totalDays = reminderDays * quantity;
  if (totalDays <= 0) return null;
  const date = new Date(fromDate);
  date.setDate(date.getDate() + totalDays);
  return date;
}

export async function createOrderReminders(order) {
  const customerId = order.userId;
  const deliveryDate = new Date();
  const reminders = [];

  for (let i = 0; i < order.items.length; i++) {
    const item = order.items[i];
    const product = await Product.findById(item.productId).lean();

    if (!product || !product.enableReminder || !product.reminderDays || product.reminderDays <= 0) {
      continue;
    }

    const reminderDate = computeReminderDate(deliveryDate, product.reminderDays, item.quantity);
    if (!reminderDate) continue;

    // Close any existing active reminder for same customer+product
    await Reminder.updateMany(
      {
        customerId,
        productId: item.productId,
        status: { $in: ACTIVE_STATUSES },
      },
      { $set: { status: "PURCHASED_AGAIN" } }
    );

    const reminder = await Reminder.create({
      customerId,
      orderId: order._id,
      orderItemIndex: i,
      productId: item.productId,
      quantity: item.quantity,
      reminderDays: product.reminderDays * item.quantity,
      purchaseDate: deliveryDate,
      reminderDate,
    });

    reminders.push(reminder);
  }

  return reminders;
}

export async function maybeCreateRemindersForOrder(orderId) {
  const order = await Order.findById(orderId).lean();
  if (!order) return [];

  const isDelivered =
    order.shippingStatus === "DELIVERED" ||
    order.status === "Delivered";

  if (!isDelivered) return [];

  return createOrderReminders(order);
}

export async function getTodayReminders() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return Reminder.find({
    status: "PENDING",
    reminderDate: { $gte: today, $lt: tomorrow },
  }).populate("customerId", "fullName mobileNumber email")
    .populate("productId", "name images")
    .sort({ reminderDate: 1 });
}

export async function getReminders(filters = {}) {
  const query = {};

  if (filters.status) query.status = filters.status;
  if (filters.whatsappStatus) query.whatsappStatus = filters.whatsappStatus;
  if (filters.callStatus) query.callStatus = filters.callStatus;
  if (filters.productId) query.productId = filters.productId;
  if (filters.customerId) query.customerId = filters.customerId;

  if (filters.dateFrom || filters.dateTo) {
    query.reminderDate = {};
    if (filters.dateFrom) query.reminderDate.$gte = new Date(filters.dateFrom);
    if (filters.dateTo) {
      const end = new Date(filters.dateTo);
      end.setHours(23, 59, 59, 999);
      query.reminderDate.$lte = end;
    }
  }

  if (filters.period === "today") {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    query.reminderDate = { $gte: today, $lt: tomorrow };
  }

  if (filters.period === "tomorrow") {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);
    query.reminderDate = { $gte: tomorrow, $lt: dayAfter };
  }

  if (filters.period === "week") {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekLater = new Date(today);
    weekLater.setDate(weekLater.getDate() + 7);
    query.reminderDate = { $gte: today, $lt: weekLater };
  }

  // Search across referenced collections
  if (filters.search) {
    const searchRegex = { $regex: filters.search, $options: "i" };
    const [matchingUsers, matchingProducts] = await Promise.all([
      User.find({
        $or: [
          { fullName: searchRegex },
          { mobileNumber: searchRegex },
        ],
      }).select("_id").lean(),
      Product.find({
        $or: [
          { "name.en": searchRegex },
          { "name.ta": searchRegex },
        ],
      }).select("_id").lean(),
    ]);
    const userIds = matchingUsers.map(u => u._id);
    const productIds = matchingProducts.map(p => p._id);
    query.$or = [
      { customerId: { $in: userIds } },
      { productId: { $in: productIds } },
    ];
  }

  let sortOption = { reminderDate: 1 };
  if (filters.sort) {
    if (filters.sort === "newest") sortOption = { createdAt: -1 };
    if (filters.sort === "oldest") sortOption = { createdAt: 1 };
  }

  const page = Math.max(1, Number(filters.page) || 1);
  const limit = Math.min(100, Number(filters.limit) || 50);
  const skip = (page - 1) * limit;

  const [reminders, total] = await Promise.all([
    Reminder.find(query)
      .populate("customerId", "fullName mobileNumber email")
      .populate("productId", "name images")
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean(),
    Reminder.countDocuments(query),
  ]);

  return { reminders, total, page, totalPages: Math.ceil(total / limit) };
}
