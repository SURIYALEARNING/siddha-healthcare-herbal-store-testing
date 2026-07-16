import Order from '../models/Order.js';
import Shipment from '../models/Shipment.js';
import * as shiprocket from '../services/shiprocket.service.js';

export async function getShippingOrders(req, res) {
  try {
    const orders = await Order.find({
      paymentStatus: "Paid",
      shippingStatus: { $ne: "CANCELLED" },
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

export async function confirmOrder(req, res) {
  try {
    const { orderId } = req.body;
    const order = await Order.findByIdAndUpdate(
      orderId,
      { $set: { shippingStatus: "CONFIRMED", status: "Shipped" } },
      { new: true }
    );
    if (!order) return res.status(404).json({ error: "Order not found." });
    res.json({ message: "Order confirmed for shipping!", order });
  } catch (error) {
    res.status(500).json({ error: "Failed to confirm order." });
  }
}

export async function markPacked(req, res) {
  try {
    const { orderId } = req.body;
    const { length, breadth, height, weight } = req.body;
    const order = await Order.findByIdAndUpdate(
      orderId,
      { $set: { shippingStatus: "PACKED" } },
      { new: true }
    );
    if (!order) return res.status(404).json({ error: "Order not found." });
    await Shipment.findOneAndUpdate(
      { orderId },
      { $set: { "dimensions.length": length, "dimensions.breadth": breadth, "dimensions.height": height, weight } },
      { upsert: true }
    );
    res.json({ message: "Order marked as packed!", order });
  } catch (error) {
    res.status(500).json({ error: "Failed to mark packed." });
  }
}

export async function createShiprocketOrder(req, res) {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found." });

    const firstItem = order.items[0];
    const payload = {
      order_id: order._id.toString(),
      order_date: new Date(order.createdAt).toISOString().split("T")[0],
      pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || "primary",
      billing_customer_name: order.fullName,
      billing_last_name: "",
      billing_address: order.shippingAddress.address,
      billing_city: order.shippingAddress.district,
      billing_pincode: order.shippingAddress.pincode,
      billing_state: order.shippingAddress.state,
      billing_country: "India",
      billing_email: order.email,
      billing_phone: order.mobileNumber,
      shipping_is_billing: true,
      order_items: order.items.map(item => ({
        name: item.name,
        sku: item.productId?.toString() || "SKU001",
        units: item.quantity,
        selling_price: item.price,
      })),
      payment_method: order.paymentMethod === "Cash on Delivery" ? "COD" : "Prepaid",
      sub_total: order.subtotal,
      length: req.body.length || 10,
      breadth: req.body.breadth || 10,
      height: req.body.height || 10,
      weight: req.body.weight || 0.5,
    };

    const srRes = await shiprocket.createOrder(payload);
    const srOrderId = srRes.order_id;
    const shipmentId = srRes.shipment_id;

    await Order.findByIdAndUpdate(orderId, {
      $set: { shiprocketOrderId: srOrderId, shippingStatus: "CONFIRMED" },
    });

    await Shipment.findOneAndUpdate(
      { orderId },
      { $set: { shiprocketOrderId: srOrderId, _id: shipmentId } },
      { upsert: true }
    );

    res.json({ message: "Shiprocket order created!", shiprocketOrderId: srOrderId, shipmentId });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to create Shiprocket order." });
  }
}

export async function generateAWB(req, res) {
  try {
    const { orderId, shipmentId } = req.body;
    const srRes = await shiprocket.generateAWB(shipmentId);
    const awbCode = srRes.awb_code;
    const courierName = srRes.courier_name;

    await Order.findByIdAndUpdate(orderId, {
      $set: { awbCode, courierName },
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
        await Order.findByIdAndUpdate(shipment.orderId, {
          $set: { shippingStatus: "DELIVERED", status: "Delivered" },
        });
        await Shipment.findByIdAndUpdate(shipmentId, {
          $set: { deliveredAt: new Date() },
        });
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

    await Order.findByIdAndUpdate(orderId, {
      $set: { shippingStatus: "CANCELLED", status: "Cancelled" },
    });

    res.json({ message: "Shipment cancelled." });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to cancel shipment." });
  }
}
