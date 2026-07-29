import Order from "../models/Order.js";
import { STATUS_TITLES, STATUS_DESCRIPTIONS, ORDER_STATUSES } from "../constants/orderStatus.js";

export async function addTimelineEvent({
  orderId,
  status,
  title,
  description,
  updatedBy = "SYSTEM",
  source = "SYSTEM",
}) {
  const event = {
    status,
    title: title || STATUS_TITLES[status] || status,
    description: description || STATUS_DESCRIPTIONS[status] || "",
    createdAt: new Date(),
    updatedBy,
    source,
  };

  await Order.findByIdAndUpdate(orderId, {
    $push: { timeline: event },
    $set: { currentStatus: status },
  });

  return event;
}

export async function addPaymentTimelineEvent(orderId, source = "SYSTEM") {
  return addTimelineEvent({
    orderId,
    status: ORDER_STATUSES.PENDING,
    title: "Payment Successful",
    description: "Payment has been received successfully.",
    source,
  });
}

export async function addShiprocketAssignedEvent(orderId, shiprocketOrderId) {
  return addTimelineEvent({
    orderId,
    status: ORDER_STATUSES.CONFIRMED,
    title: "Assigned To Shiprocket",
    description: `Order assigned to Shiprocket (ID: ${shiprocketOrderId}).`,
    updatedBy: "STAFF",
    source: "STAFF",
  });
}

export async function addShiprocketTrackingEvent(orderId, status, eventData) {
  const titleMap = {
    PICKED_UP: "Pickup Completed",
    IN_TRANSIT: "In Transit",
    OUT_FOR_DELIVERY: "Out For Delivery",
    DELIVERED: "Delivered",
  };

  const statusMap = {
    PICKED_UP: ORDER_STATUSES.SHIPPED,
    IN_TRANSIT: ORDER_STATUSES.SHIPPED,
    OUT_FOR_DELIVERY: ORDER_STATUSES.OUT_FOR_DELIVERY,
    DELIVERED: ORDER_STATUSES.DELIVERED,
  };

  return addTimelineEvent({
    orderId,
    status: statusMap[status] || status,
    title: titleMap[status] || status,
    description: eventData?.message || eventData?.status || "",
    source: "SHIPROCKET",
  });
}
