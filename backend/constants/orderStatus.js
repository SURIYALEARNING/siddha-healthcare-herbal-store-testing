export const ORDER_STATUSES = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PACKED: "Packed",
  READY_TO_SHIP: "Ready To Ship",
  SHIPPED: "Shipped",
  OUT_FOR_DELIVERY: "Out For Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  RETURNED: "Returned",
  REFUNDED: "Refunded",
};

export const FULFILLMENT_FLOW = [
  ORDER_STATUSES.PENDING,
  ORDER_STATUSES.CONFIRMED,
  ORDER_STATUSES.PACKED,
  ORDER_STATUSES.READY_TO_SHIP,
  ORDER_STATUSES.SHIPPED,
  ORDER_STATUSES.OUT_FOR_DELIVERY,
  ORDER_STATUSES.DELIVERED,
];

export const TERMINAL_STATUSES = [
  ORDER_STATUSES.DELIVERED,
  ORDER_STATUSES.CANCELLED,
  ORDER_STATUSES.RETURNED,
  ORDER_STATUSES.REFUNDED,
];

export const STATUS_TITLES = {
  [ORDER_STATUSES.PENDING]: "Order Placed",
  [ORDER_STATUSES.CONFIRMED]: "Confirmed",
  [ORDER_STATUSES.PACKED]: "Packed",
  [ORDER_STATUSES.READY_TO_SHIP]: "Ready To Ship",
  [ORDER_STATUSES.SHIPPED]: "Shipped",
  [ORDER_STATUSES.OUT_FOR_DELIVERY]: "Out For Delivery",
  [ORDER_STATUSES.DELIVERED]: "Delivered",
  [ORDER_STATUSES.CANCELLED]: "Cancelled",
  [ORDER_STATUSES.RETURNED]: "Returned",
  [ORDER_STATUSES.REFUNDED]: "Refunded",
};

export const STATUS_DESCRIPTIONS = {
  [ORDER_STATUSES.PENDING]: "Your order has been placed successfully.",
  [ORDER_STATUSES.CONFIRMED]: "Your order has been confirmed.",
  [ORDER_STATUSES.PACKED]: "Your items have been packed and are ready to ship.",
  [ORDER_STATUSES.READY_TO_SHIP]: "Order is ready to be handed over to the courier.",
  [ORDER_STATUSES.SHIPPED]: "Your order has been shipped.",
  [ORDER_STATUSES.OUT_FOR_DELIVERY]: "Your order is out for delivery.",
  [ORDER_STATUSES.DELIVERED]: "Your order has been delivered successfully.",
  [ORDER_STATUSES.CANCELLED]: "Your order has been cancelled.",
  [ORDER_STATUSES.RETURNED]: "Your order has been returned.",
  [ORDER_STATUSES.REFUNDED]: "Your order has been refunded.",
};
