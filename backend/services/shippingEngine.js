import Product from "../models/Product.js";
import Courier from "../models/Courier.js";
import CourierZone from "../models/CourierZone.js";
import CourierRate from "../models/CourierRate.js";

export const MIN_SHIPPING_WEIGHT_G = 0;

export function normalizeWeight(weightGrams) {
  const w = Number(weightGrams);
  return Number.isFinite(w) && w > 0 ? w : 0;
}

export function computeShippingCharge({ upTo500g, upTo1kg, additionalKg, weightGrams }) {
  const weight = normalizeWeight(weightGrams);
  const upTo500 = Number(upTo500g) || 0;
  const oneKg = Number(upTo1kg) || 0;
  const extraKg = Number(additionalKg) || 0;

  if (weight <= 0) return 0;

  if (weight <= 500) return upTo500;
  if (weight <= 1000) return oneKg;

  const remaining = weight - 1000;
  const extraUnits = Math.ceil(remaining / 1000);
  return oneKg + extraUnits * extraKg;
}

export function computeTotalPackedWeight(items) {
  if (!Array.isArray(items)) return 0;
  let total = 0;
  for (const item of items) {
    const qty = Number(item.quantity) || 0;
    const packed = Number(item.packedWeight) || 0;
    total += packed * qty;
  }
  return total;
}

export async function getPackedWeightFromItems(items) {
  if (!Array.isArray(items) || items.length === 0) return 0;
  let total = 0;
  for (const item of items) {
    if (!item.productId) continue;
    const product = await Product.findById(item.productId).select("packedWeight").lean();
    if (!product) continue;
    const packed = normalizeWeight(product.packedWeight);
    total += packed * (Number(item.quantity) || 0);
  }
  return total;
}

export async function getDefaultCourier() {
  let courier = await Courier.findOne({ isDefault: true, isActive: true }).lean();
  if (!courier) {
    courier = await Courier.findOne({ isActive: true }).sort({ createdAt: 1 }).lean();
  }
  return courier || null;
}

export function matchPincode(pincodeList, pincode) {
  if (!Array.isArray(pincodeList) || pincodeList.length === 0) return false;
  const normalizedPincode = String(pincode || "").trim();
  if (!normalizedPincode) return false;
  return pincodeList.some((entry) => {
    const value = String(entry || "").trim();
    if (!value) return false;
    if (value.includes("-")) {
      const [from, to] = value.split("-").map((v) => v.trim());
      const num = Number(normalizedPincode);
      if (Number.isFinite(Number(from)) && Number.isFinite(Number(to))) {
        return num >= Number(from) && num <= Number(to);
      }
    }
    return normalizedPincode === value;
  });
}

function normalizeName(value) {
  return String(value || "").trim().toLowerCase();
}

function matchList(list, value) {
  if (!Array.isArray(list) || list.length === 0) return false;
  const needle = normalizeName(value);
  if (!needle) return false;
  return list.some((entry) => normalizeName(entry) === needle);
}

export async function findZoneForAddress({ pincode, state, district, courierId }) {
  const filter = courierId ? { courierId } : {};
  const zones = await CourierZone.find(filter).lean();
  const matches = [];

  for (const zone of zones) {
    if (matchPincode(zone.pincodes, pincode)) {
      matches.push({ zone, priority: 3 });
      continue;
    }
    if (matchList(zone.districts, district)) {
      matches.push({ zone, priority: 2 });
      continue;
    }
    if (matchList(zone.states, state)) {
      matches.push({ zone, priority: 1 });
    }
  }

  if (matches.length === 0) return null;

  matches.sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    return new Date(a.zone.createdAt) - new Date(b.zone.createdAt);
  });

  return matches[0].zone;
}

export async function getCourierRateForZone(zoneId) {
  return CourierRate.findOne({ zoneId }).lean();
}

export async function getShippingRatesForAddress({ pincode, state, district }) {
  const couriers = await Courier.find({ isActive: true }).sort({ isDefault: -1, createdAt: 1 }).lean();
  const results = [];

  for (const courier of couriers) {
    const zone = await findZoneForAddress({
      pincode,
      state,
      district,
      courierId: courier._id,
    });
    if (!zone) continue;

    const rate = await getCourierRateForZone(zone._id);
    if (!rate) continue;

    results.push({
      courierId: courier._id,
      courierName: courier.name,
      logo: courier.logo,
      description: courier.description,
      isDefault: courier.isDefault,
      zoneId: zone._id,
      zoneName: zone.name,
      rate: {
        upTo500g: rate.upTo500g,
        upTo1kg: rate.upTo1kg,
        additionalKg: rate.additionalKg,
      },
    });
  }

  return results;
}

export async function calculateShipping({ items, pincode, state, district, courierId }) {
  const packedWeight = await getPackedWeightFromItems(items);

  const couriers = await Courier.find({ isActive: true }).sort({ isDefault: -1, createdAt: 1 }).lean();
  const options = [];

  for (const courier of couriers) {
    const zone = await findZoneForAddress({
      pincode,
      state,
      district,
      courierId: courier._id,
    });
    if (!zone) continue;

    const rate = await getCourierRateForZone(zone._id);
    if (!rate) continue;

    const charge = computeShippingCharge({
      upTo500g: rate.upTo500g,
      upTo1kg: rate.upTo1kg,
      additionalKg: rate.additionalKg,
      weightGrams: packedWeight,
    });

    options.push({
      courierId: courier._id,
      courierName: courier.name,
      logo: courier.logo,
      description: courier.description,
      isDefault: courier.isDefault,
      zoneId: zone._id,
      zoneName: zone.name,
      charge,
      rate: {
        upTo500g: rate.upTo500g,
        upTo1kg: rate.upTo1kg,
        additionalKg: rate.additionalKg,
      },
    });
  }

  let selected = null;
  if (courierId) {
    selected = options.find((o) => o.courierId.toString() === String(courierId)) || null;
  }
  if (!selected) {
    selected = options.find((o) => o.isDefault) || options[0] || null;
  }

  return {
    packedWeight,
    options,
    selected,
    courier: selected,
  };
}
