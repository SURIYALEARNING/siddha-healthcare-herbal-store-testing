import Product from "../models/Product.js";
import Coupon from "../models/Coupon.js";
import {
  calculateShipping,
  computeTotalPackedWeight,
  getDefaultCourier,
} from "./shippingEngine.js";

const DELIVERY_FREE_THRESHOLD = 500;
const DELIVERY_CHARGE = 50;

export async function calculateOrder({ items, couponCode, shippingAddress, courierId }) {
  if (!items?.length) {
    throw new Error("At least one item is required.");
  }

  let subtotal = 0;
  const calculatedItems = [];

  for (const item of items) {
    if (!item.productId || !item.quantity || item.quantity <= 0) {
      throw new Error("Each item must have a valid productId and positive quantity");
    }

    const product = await Product.findById(item.productId).lean();
    if (!product) {
      throw new Error(`Product with ID ${item.productId} not found.`);
    }
    if (!product.isActive) {
      throw new Error(`Product "${product.name?.en || product.name}" is not available for purchase.`);
    }
    if (product.stock !== undefined && product.stock < item.quantity) {
      throw new Error(`Insufficient stock for "${product.name?.en || product.name}".`);
    }

    const unitPrice = product.discountPrice || product.price;
    const itemTotal = unitPrice * item.quantity;
    subtotal += itemTotal;

    calculatedItems.push({
      productId: product._id,
      name: product.name?.en || product.name || "Product",
      image: product.images?.[0] || "",
      purchasedPrice: unitPrice,
      quantity: item.quantity,
      itemTotal,
      packedWeight: Number(product.packedWeight) || 0,
    });
  }

  let couponDiscount = 0;
  let appliedCouponCode = null;

  if (couponCode) {
    const coupon = await Coupon.findOne({
      code: couponCode.toUpperCase(),
      active: true,
    });

    if (!coupon) {
      throw new Error("Invalid or expired coupon code.");
    }

    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      throw new Error("Coupon has expired.");
    }

    if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
      throw new Error(`Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon.`);
    }

    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      throw new Error("Coupon usage limit has been reached.");
    }

    couponDiscount = Math.round(subtotal * (coupon.discountPercent / 100));
    appliedCouponCode = coupon.code;
  }

  const packedWeight = computeTotalPackedWeight(calculatedItems);

  let deliveryCharges = 0;
  let shippingZone = null;
  let shippingCourierId = null;
  let shippingCourierName = null;
  let shippingAvailable = false;

  const pincode = shippingAddress?.pincode;

  if (pincode && /^\d{6}$/.test(String(pincode))) {
    const result = await calculateShipping({
      items,
      pincode: String(pincode),
      state: shippingAddress.state,
      district: shippingAddress.district,
      courierId,
    });

    if (result.selected) {
      deliveryCharges = result.selected.charge || 0;
      shippingZone = result.selected.zoneName;
      shippingCourierId = result.selected.courierId;
      shippingCourierName = result.selected.courierName;
      shippingAvailable = true;
    }
  }

  if (!shippingAvailable) {
    const fallbackCourier = await getDefaultCourier();
    if (fallbackCourier && pincode && /^\d{6}$/.test(String(pincode))) {
      const result = await calculateShipping({
        items,
        pincode: String(pincode),
        state: shippingAddress.state,
        district: shippingAddress.district,
        courierId: fallbackCourier._id,
      });
      if (result.selected) {
        deliveryCharges = result.selected.charge || 0;
        shippingZone = result.selected.zoneName;
        shippingCourierId = result.selected.courierId;
        shippingCourierName = result.selected.courierName;
        shippingAvailable = true;
      }
    }
  }

  if (!shippingAvailable) {
    deliveryCharges = subtotal > DELIVERY_FREE_THRESHOLD ? 0 : DELIVERY_CHARGE;
  }

  const total = subtotal - couponDiscount + deliveryCharges;

  if (total <= 0) {
    throw new Error("Calculated payable amount must be greater than zero.");
  }

  return {
    items: calculatedItems,
    subtotal,
    couponDiscount,
    appliedCouponCode,
    deliveryCharges,
    packedWeight,
    shippingZone,
    shippingCourierId,
    shippingCourierName,
    total,
  };
}
