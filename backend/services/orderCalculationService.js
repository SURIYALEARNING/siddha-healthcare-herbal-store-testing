import Product from "../models/Product.js";
import Coupon from "../models/Coupon.js";

const DELIVERY_FREE_THRESHOLD = 500;
const DELIVERY_CHARGE = 50;

export async function calculateOrder({ items, couponCode }) {
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

  const deliveryCharges = subtotal > DELIVERY_FREE_THRESHOLD ? 0 : DELIVERY_CHARGE;
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
    total,
  };
}
