import Order from '../models/Order.js';
import Shipment from '../models/Shipment.js';
import ShiprocketAuth from '../models/ShiprocketAuth.js';
import { User } from '../models/User.js';
import * as shiprocket from '../services/shiprocket.service.js';
import { maybeCreateRemindersForOrder } from '../services/reminderService.js';
import { addTimelineEvent, addShiprocketAssignedEvent, addShiprocketTrackingEvent } from '../services/timelineService.js';
import { ORDER_STATUSES } from '../constants/orderStatus.js';

export async function getShippingOrders(req, res) {
  try {
    const orders = await Order.find({
      paymentStatus: "Paid",
      $or: [
        { currentStatus: ORDER_STATUSES.PENDING },
        { currentStatus: { $exists: false } },
      ],
    }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch shipping orders." });
  }
}

export async function getShippingStats(req, res) {
  try {
    const all = await Order.find({ paymentStatus: "Paid" });
    const stats = {
      total: all.length,
      paid: all.filter(o => o.shippingStatus === "PAID").length,
      confirmed: all.filter(o => o.shippingStatus === "CONFIRMED").length,
      packed: all.filter(o => o.shippingStatus === "PACKED").length,
      pickupRequested: all.filter(o => o.shippingStatus === "PICKUP_REQUESTED").length,
      inTransit: all.filter(o => o.shippingStatus === "IN_TRANSIT" || o.shippingStatus === "PICKED_UP" || o.shippingStatus === "OUT_FOR_DELIVERY").length,
      delivered: all.filter(o => o.shippingStatus === "DELIVERED").length,
      cancelled: all.filter(o => o.shippingStatus === "CANCELLED").length,
      returned: all.filter(o => o.shippingStatus === "RETURNED").length,
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch shipping stats." });
  }
}

export async function getPickupLocations(req, res) {
  try {
    const doc = await ShiprocketAuth.findOne().sort({ createdAt: -1 }).lean();
    const locations = (doc?.pickupLocations || []).filter((l) => l.name);
    res.json(locations.length > 0 ? locations : [{ name: process.env.SHIPROCKET_PICKUP_LOCATION || "primary", address: "", email: "", phone: "" }]);
  } catch {
    res.json([{ name: process.env.SHIPROCKET_PICKUP_LOCATION || "primary", address: "", email: "", phone: "" }]);
  }
}

export async function confirmOrder(req, res) {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found." });

    await addTimelineEvent({
      orderId,
      status: ORDER_STATUSES.CONFIRMED,
      updatedBy: req.user?.id || "STAFF",
      source: "STAFF",
    });

    await Order.findByIdAndUpdate(orderId, {
      $set: { shippingStatus: "CONFIRMED", status: "Shipped", currentStatus: ORDER_STATUSES.CONFIRMED },
    });

    const updated = await Order.findById(orderId);
    res.json({ message: "Order confirmed for shipping!", order: updated });
  } catch (error) {
    res.status(500).json({ error: "Failed to confirm order." });
  }
}

export async function markPacked(req, res) {
  try {
    const { orderId, length, breadth, height, weight } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found." });

    await addTimelineEvent({
      orderId,
      status: ORDER_STATUSES.PACKED,
      updatedBy: req.user?.id || "STAFF",
      source: "STAFF",
    });

    await Order.findByIdAndUpdate(orderId, {
      $set: { shippingStatus: "PACKED", currentStatus: ORDER_STATUSES.PACKED },
    });

    await Shipment.findOneAndUpdate(
      { orderId },
      {
        $set: {
          "dimensions.length": length,
          "dimensions.breadth": breadth,
          "dimensions.height": height,
          weight,
        },
      },
      { upsert: true }
    );

    const updated = await Order.findById(orderId);
    res.json({ message: "Order marked as packed!", order: updated });
  } catch (error) {
    res.status(500).json({ error: "Failed to mark packed." });
  }
}

export async function assignShiprocket(req, res) {
  try {
    const { orderId, courier_type, comment, billing_address_2 } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found." });

    const reg = (key, fallback) => req.body[key] !== undefined && req.body[key] !== "" ? req.body[key] : fallback;

    const payload = {
      order_id: order._id.toString(),
      order_date: reg("order_date", new Date(order.createdAt).toISOString().split("T")[0] + " 11:11"),
      pickup_location: reg("pickup_location", process.env.SHIPROCKET_PICKUP_LOCATION || "primary"),
      comment: reg("comment", ""),
      billing_customer_name: reg("billing_customer_name", order.fullName),
      billing_last_name: reg("billing_last_name", ""),
      billing_address: reg("billing_address", order.shippingAddress.address),
      billing_address_2: reg("billing_address_2", ""),
      billing_city: reg("billing_city", order.shippingAddress.district),
      billing_pincode: reg("billing_pincode", order.shippingAddress.pincode),
      billing_state: reg("billing_state", order.shippingAddress.state),
      billing_country: reg("billing_country", "India"),
      billing_email: reg("billing_email", order.email),
      billing_phone: reg("billing_phone", order.mobileNumber),
      shipping_is_billing: true,
      order_items: order.items.map(item => ({
        name: item.name,
        sku: item.productId?.toString() || "SKU001",
        units: item.quantity,
        selling_price: item.purchasedPrice || item.itemTotal / item.quantity,
      })),
      payment_method: reg("payment_method", order.paymentMethod === "Cash on Delivery" ? "COD" : "Prepaid"),
      sub_total: reg("sub_total", order.subtotal),
      length: reg("length", 10),
      breadth: reg("breadth", 10),
      height: reg("height", 10),
      weight: reg("weight", 0.5),
    };

    if (courier_type) payload.courier_type = courier_type;

    const srRes = await shiprocket.createOrder(payload);
    const srOrderId = srRes.order_id;
    const shipmentId = srRes.shipment_id;

    await Order.findByIdAndUpdate(orderId, {
      $set: {
        currentStatus: ORDER_STATUSES.CONFIRMED,
        shippingMethod: "SHIPROCKET",
        shiprocketOrderId: srOrderId,
        "shiprocketDetails.shipmentId": shipmentId,
        shippingStatus: "CONFIRMED",
      },
    });

    await Shipment.findOneAndUpdate(
      { orderId },
      { $set: { shiprocketOrderId: srOrderId, _id: shipmentId } },
      { upsert: true }
    );

    await addShiprocketAssignedEvent(orderId, srOrderId);

    res.json({ message: "Shiprocket order created!", shiprocketOrderId: srOrderId, shipmentId });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to create Shiprocket order." });
  }
}

export async function createShiprocketOrder(req, res) {
  return assignShiprocket(req, res);
}

export async function generateAWB(req, res) {
  try {
    const { orderId, shipmentId } = req.body;
    const srRes = await shiprocket.generateAWB(shipmentId);
    const awbCode = srRes.awb_code;
    const courierName = srRes.courier_name;

    await Order.findByIdAndUpdate(orderId, {
      $set: {
        awbCode,
        courierName,
        "tracking.awbNumber": awbCode,
        "tracking.courierName": courierName,
      },
    });

    await Shipment.findOneAndUpdate({ orderId }, {
      $set: { awbCode, courierName, trackingStatus: "AWB_GENERATED" },
    });

    res.json({ message: "AWB generated!", awbCode, courierName });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to generate AWB." });
  }
}

export async function requestPickup(req, res) {
  try {
    const { orderId, shipmentIds } = req.body;
    const srRes = await shiprocket.requestPickup(shipmentIds);

    await Order.findByIdAndUpdate(orderId, {
      $set: { shippingStatus: "PICKUP_REQUESTED" },
    });

    await Shipment.findOneAndUpdate({ orderId }, {
      $set: { pickupStatus: "REQUESTED", trackingStatus: "PICKUP_REQUESTED" },
    });

    res.json({ message: "Pickup requested!", response: srRes });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to request pickup." });
  }
}

export async function trackShipment(req, res) {
  try {
    const { shipmentId } = req.params;
    const data = await shiprocket.trackShipment(shipmentId);
    const tracking = data.tracking_data || {};

    await Shipment.findByIdAndUpdate(shipmentId, {
      $set: { trackingHistory: tracking.history || [], trackingStatus: tracking.status },
    });

    if (tracking.status === "Delivered") {
      const shipment = await Shipment.findById(shipmentId);
      if (shipment) {
        const currentOrder = await Order.findById(shipment.orderId);
        if (currentOrder && currentOrder.currentStatus !== ORDER_STATUSES.DELIVERED) {
          await addShiprocketTrackingEvent(shipment.orderId, "DELIVERED", tracking);
          await Order.findByIdAndUpdate(shipment.orderId, {
            $set: {
              shippingStatus: "DELIVERED",
              status: "Delivered",
              "tracking.deliveredAt": new Date(),
            },
          });
          await Shipment.findByIdAndUpdate(shipmentId, {
            $set: { deliveredAt: new Date() },
          });
          maybeCreateRemindersForOrder(shipment.orderId).catch((err) =>
            console.error("Failed to create delivery reminders:", err)
          );
        }
      }
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to track shipment." });
  }
}

export async function cancelShipment(req, res) {
  try {
    const { orderId, shipmentIds } = req.body;
    await shiprocket.cancelShipment(shipmentIds);

    await addTimelineEvent({
      orderId,
      status: ORDER_STATUSES.CANCELLED,
      updatedBy: req.user?.id || "STAFF",
      source: "STAFF",
    });

    await Order.findByIdAndUpdate(orderId, {
      $set: { shippingStatus: "CANCELLED", status: "Cancelled" },
    });

    res.json({ message: "Shipment cancelled." });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to cancel shipment." });
  }
}

export async function checkPincode(req, res) {
  try {
    const { pincode, weight, cod } = req.body;

    if (!pincode) {
      return res.status(400).json({ success: false, message: "Pincode is required." });
    }
    if (!/^\d{6}$/.test(String(pincode))) {
      return res.status(400).json({ success: false, message: "Invalid pincode format." });
    }

    const pickupPincode = process.env.SHIPROCKET_PICKUP_PINCODE || "600001";
    const result = await shiprocket.checkServiceability({
      pickupPincode,
      deliveryPincode: String(pincode),
      weight: Number(weight) || Number(process.env.SHIPROCKET_DEFAULT_WEIGHT) || 0.5,
      cod: cod === true || cod === "true",
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Failed to check pincode serviceability." });
  }
}

export async function checkMyAddress(req, res) {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    const addr = user.address;
    if (!addr || !addr.pincode) {
      return res.status(400).json({ success: false, message: "No default address found. Please add an address first." });
    }

    const pickupPincode = process.env.SHIPROCKET_PICKUP_PINCODE || "600001";
    const result = await shiprocket.checkServiceability({
      pickupPincode,
      deliveryPincode: String(addr.pincode),
      weight: Number(process.env.SHIPROCKET_DEFAULT_WEIGHT) || 0.5,
      cod: false,
    });

    res.json({ ...result, pincode: addr.pincode, address: addr.address });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Failed to check address serviceability." });
  }
}
