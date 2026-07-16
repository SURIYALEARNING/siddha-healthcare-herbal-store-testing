import state from '../data/index.js';
import { getLoggedUser } from '../services/authHelper.js';

export function getCoupons(req, res) {
  res.json(state.coupons);
}

export function applyCoupon(req, res) {
  const { code } = req.body;
  const coupon = state.coupons.find(c => c.code.toUpperCase() === code.toUpperCase() && c.active);
  if (!coupon) {
    return res.status(400).json({ error: "Invalid or expired coupon code." });
  }
  res.json({ message: "Coupon applied successfully!", discountPercent: coupon.discountPercent });
}

export function manageCoupon(req, res) {
  const user = getLoggedUser(req);
  if (!user || !user.isAdmin) return res.status(403).json({ error: "Admin privilege required." });

  const { code, discountPercent, expiryDate } = req.body;
  if (!code || !discountPercent) {
    return res.status(400).json({ error: "Code and discount percent are required details." });
  }

  const existing = state.coupons.find(c => c.code.toUpperCase() === code.toUpperCase());
  if (existing) {
    existing.discountPercent = Number(discountPercent);
    existing.expiryDate = expiryDate || "2026-12-31";
    return res.json({ message: "Coupon successfully modified!", coupon: existing });
  }

  const newCoupon = {
    code: code.toUpperCase(),
    discountPercent: Number(discountPercent),
    expiryDate: expiryDate || "2026-12-31",
    active: true
  };
  state.coupons.push(newCoupon);
  res.status(201).json({ message: "New coupon coupon created!", coupon: newCoupon });
}
