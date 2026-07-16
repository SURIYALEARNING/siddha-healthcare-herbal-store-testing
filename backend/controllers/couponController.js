import Coupon from '../models/Coupon.js';

export async function getCoupons(req, res) {
  try {
    const coupons = await Coupon.find();
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch coupons." });
  }
}

export async function applyCoupon(req, res) {
  try {
    const { code } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), active: true });
    if (!coupon) {
      return res.status(400).json({ error: "Invalid or expired coupon code." });
    }
    res.json({ message: "Coupon applied successfully!", discountPercent: coupon.discountPercent });
  } catch (error) {
    res.status(500).json({ error: "Failed to apply coupon." });
  }
}

export async function manageCoupon(req, res) {
  try {
    const { code, discountPercent, expiryDate } = req.body;
    if (!code || !discountPercent) {
      return res.status(400).json({ error: "Code and discount percent are required." });
    }

    let coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (coupon) {
      coupon.discountPercent = Number(discountPercent);
      coupon.expiryDate = expiryDate || "2026-12-31";
      await coupon.save();
      return res.json({ message: "Coupon successfully modified!", coupon });
    }

    coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountPercent: Number(discountPercent),
      expiryDate: expiryDate || "2026-12-31",
    });

    res.status(201).json({ message: "New coupon created!", coupon });
  } catch (error) {
    res.status(500).json({ error: "Failed to manage coupon." });
  }
}
