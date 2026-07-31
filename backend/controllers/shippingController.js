import jwt from 'jsonwebtoken';
import Order from '../models/Order.js';
import Shipment from '../models/Shipment.js';
import { User } from '../models/User.js';
import * as shiprocket from '../services/shiprocket.service.js';
import { maybeCreateRemindersForOrder } from '../services/reminderService.js';
import { addTimelineEvent, addShiprocketAssignedEvent, addShiprocketTrackingEvent } from '../services/timelineService.js';
import { ORDER_STATUSES } from '../constants/orderStatus.js';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

export async function getShippingOrders(req, res) {
  try {
    const orders = await Order.find({
      paymentStatus: "Paid",
      currentStatus: { $in: [ORDER_STATUSES.PENDING, ORDER_STATUSES.READY_TO_SHIP] },
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
      newOrders: all.filter(o => !o.currentStatus || o.currentStatus === ORDER_STATUSES.PENDING).length,
      readyToShip: all.filter(o => o.currentStatus === ORDER_STATUSES.READY_TO_SHIP).length,
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
    let locations = await shiprocket.getStoredPickupLocations();
    if (locations.length === 0) {
      await shiprocket.syncPickupLocations();
      locations = await shiprocket.getStoredPickupLocations();
    }
    res.json(locations);
  } catch {
    res.json([]);
  }
}

export async function syncPickupLocations(req, res) {
  try {
    const result = await shiprocket.syncPickupLocations();
    res.json({ message: "Pickup locations synced successfully!", ...result });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to sync pickup locations." });
  }
}

export async function confirmOrder(req, res) {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ error: "orderId is required." });
    }
    const order = await Order.findById(orderId).catch((err) => {
      console.error("confirmOrder: findById failed:", err.message);
      return null;
    });
    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }

    const event = {
      status: ORDER_STATUSES.CONFIRMED,
      title: "Confirmed",
      description: "Order confirmed for shipping.",
      createdAt: new Date(),
      updatedBy: req.user?.id || "STAFF",
      source: "STAFF",
    };

    await Order.findByIdAndUpdate(orderId, {
      $push: { timeline: event },
      $set: { shippingStatus: "CONFIRMED" },
    });

    const updated = await Order.findById(orderId);
    res.json({ message: "Order confirmed for shipping!", order: updated });
  } catch (error) {
    console.error("confirmOrder error:", error);
    res.status(500).json({ error: error.message || "Failed to confirm order." });
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
    if (!orderId) {
      console.error("assignShiprocket: missing orderId in body");
      return res.status(400).json({ error: "orderId is required." });
    }
    const order = await Order.findById(orderId).catch((err) => {
      console.error(`assignShiprocket: findById failed for orderId "${orderId}":`, err.message);
      return null;
    });
    if (!order) return res.status(404).json({ error: `Order not found with id: ${orderId}` });

    const reg = (key, fallback) => req.body[key] !== undefined && req.body[key] !== "" ? req.body[key] : fallback;

    let pickupLocation = req.body.pickup_location || process.env.SHIPROCKET_PICKUP_LOCATION || "primary";
    if (!req.body.pickup_location) {
      const stored = await shiprocket.getStoredPickupLocations();
      if (stored.length > 0) {
        const primary = stored.find(l => l.is_primary_location === 1) || stored[0];
        pickupLocation = primary.pickup_location || primary.name || "primary";
      }
    }

    const payload = {
      order_id: order._id.toString(),
      order_date: reg("order_date", new Date(order.createdAt).toISOString().split("T")[0] + " 11:11"),
      pickup_location: pickupLocation,
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

    await addShiprocketAssignedEvent(orderId, srOrderId);

    await Order.findByIdAndUpdate(orderId, {
      $set: {
        currentStatus: ORDER_STATUSES.READY_TO_SHIP,
        shippingMethod: "SHIPROCKET",
        shiprocketOrderId: srOrderId,
        "shiprocketDetails.shipmentId": shipmentId,
        shippingStatus: "CONFIRMED",
      },
    });

    await Shipment.findOneAndUpdate(
      { orderId },
      { $set: { shiprocketOrderId: srOrderId, shipmentId: String(shipmentId) } },
      { upsert: true }
    );

    res.json({ message: "Shiprocket order created!", shiprocketOrderId: srOrderId, shipmentId });
  } catch (error) {
    console.error("assignShiprocket error:", error);
    const detail = error.data || {};
    res.status(500).json({ error: error.message || "Failed to create Shiprocket order.", detail });
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

    await Shipment.findOneAndUpdate(
      { shiprocketOrderId: shipmentId },
      { $set: { trackingHistory: tracking.history || [], trackingStatus: tracking.status } }
    );

    if (tracking.status === "Delivered") {
      const shipment = await Shipment.findOne({ shiprocketOrderId: shipmentId });
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
          await Shipment.findByIdAndUpdate(shipment._id, {
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

    // Cache result for logged-in users
    const authHeader = req.headers['authorization'];
    if (authHeader) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
        if (decoded?.id) {
          await User.findByIdAndUpdate(decoded.id, {
            $set: {
              pincodeAvailability: {
                pincode: String(pincode),
                available: result.available,
                estimatedDays: result.estimatedDays,
                codAvailable: result.codAvailable,
                prepaidAvailable: result.prepaidAvailable,
                courier: result.courier,
                checkedAt: new Date(),
              }
            }
          });
        }
      } catch {
        // Token invalid — skip caching
      }
    }

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

    // Return cached result if available and not expired (3 days)
    const THREE_DAYS = 3 * 24 * 60 * 60 * 1000;
    if (user.pincodeAvailability?.pincode) {
      const age = Date.now() - new Date(user.pincodeAvailability.checkedAt).getTime();
      if (age < THREE_DAYS) {
        return res.json({
          success: true,
          available: user.pincodeAvailability.available,
          message: user.pincodeAvailability.available
            ? "Delivery is available"
            : "Delivery is not available",
          estimatedDays: user.pincodeAvailability.estimatedDays,
          codAvailable: user.pincodeAvailability.codAvailable,
          prepaidAvailable: user.pincodeAvailability.prepaidAvailable,
          courier: user.pincodeAvailability.courier,
          pincode: user.pincodeAvailability.pincode,
          cached: true,
        });
      }
    }

    // Fallback to saved address pincode
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

    // Cache result
    await User.findByIdAndUpdate(userId, {
      $set: {
        pincodeAvailability: {
          pincode: addr.pincode,
          available: result.available,
          estimatedDays: result.estimatedDays,
          codAvailable: result.codAvailable,
          prepaidAvailable: result.prepaidAvailable,
          courier: result.courier,
          checkedAt: new Date(),
        }
      }
    });

    res.json({ ...result, pincode: addr.pincode, address: addr.address });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Failed to check address serviceability." });
  }
}
