import mongoose from "mongoose";
import Courier from "../models/Courier.js";
import CourierZone from "../models/CourierZone.js";
import CourierRate from "../models/CourierRate.js";
import {
  calculateShipping,
  getShippingRatesForAddress,
  findZoneForAddress,
  getCourierRateForZone,
  computeShippingCharge,
} from "../services/shippingEngine.js";

const isObjectId = (id) => mongoose.Types.ObjectId.isValid(String(id || ""));

function sanitizeStringList(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((v) => String(v).trim()).filter(Boolean))];
}

function validateRateInput({ upTo500g, upTo1kg, additionalKg }) {
  const upTo500 = Number(upTo500g);
  const oneKg = Number(upTo1kg);
  const extra = Number(additionalKg);
  if (!Number.isFinite(upTo500) || upTo500 < 0) return { error: "Up to 500g price must be a non-negative number." };
  if (!Number.isFinite(oneKg) || oneKg < 0) return { error: "Up to 1kg price must be a non-negative number." };
  if (!Number.isFinite(extra) || extra < 0) return { error: "Additional kg price must be a non-negative number." };
  return { values: { upTo500g: upTo500, upTo1kg: oneKg, additionalKg: extra } };
}

async function unsetDefaultCouriers(exceptId) {
  await Courier.updateMany(
    { isDefault: true, _id: { $ne: exceptId } },
    { $set: { isDefault: false } }
  );
}

/* ------------------------------ Courier CRUD ------------------------------ */

export async function getCouriers(req, res) {
  try {
    const couriers = await Courier.find().sort({ isDefault: -1, createdAt: 1 }).lean();
    res.json(couriers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch couriers." });
  }
}

export async function getActiveCouriers(req, res) {
  try {
    const couriers = await Courier.find({ isActive: true }).sort({ isDefault: -1, createdAt: 1 }).lean();
    res.json(couriers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch couriers." });
  }
}

export async function createCourier(req, res) {
  try {
    const { name, logo, description, isActive, isDefault } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: "Company name is required." });
    }
    const existing = await Courier.findOne({ name: String(name).trim() });
    if (existing) {
      return res.status(400).json({ error: "A courier with this company name already exists." });
    }

    const courier = new Courier({
      name: String(name).trim(),
      logo: String(logo || ""),
      description: String(description || ""),
      trackingUrl: String(req.body.trackingUrl || ""),
      isActive: isActive === false ? false : true,
      isDefault: isDefault === true,
    });

    if (courier.isDefault) {
      await unsetDefaultCouriers(null);
    }

    await courier.save();
    res.status(201).json({ message: "Courier created successfully.", courier });
  } catch (error) {
    res.status(500).json({ error: "Failed to create courier." });
  }
}

export async function updateCourier(req, res) {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) return res.status(400).json({ error: "Invalid courier id." });

    const updates = {};
    if (req.body.name !== undefined) {
      if (!String(req.body.name).trim()) return res.status(400).json({ error: "Company name cannot be empty." });
      updates.name = String(req.body.name).trim();
    }
    if (req.body.logo !== undefined) updates.logo = String(req.body.logo);
    if (req.body.description !== undefined) updates.description = String(req.body.description);
    if (req.body.trackingUrl !== undefined) updates.trackingUrl = String(req.body.trackingUrl);
    if (req.body.isActive !== undefined) updates.isActive = Boolean(req.body.isActive);

    if (req.body.isDefault !== undefined && Boolean(req.body.isDefault)) {
      await unsetDefaultCouriers(new mongoose.Types.ObjectId(id));
      updates.isDefault = true;
    } else if (req.body.isDefault !== undefined) {
      updates.isDefault = false;
    }

    const courier = await Courier.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true });
    if (!courier) return res.status(404).json({ error: "Courier not found." });
    res.json({ message: "Courier updated successfully.", courier });
  } catch (error) {
    res.status(500).json({ error: "Failed to update courier." });
  }
}

export async function deleteCourier(req, res) {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) return res.status(400).json({ error: "Invalid courier id." });

    const courier = await Courier.findByIdAndDelete(id);
    if (!courier) return res.status(404).json({ error: "Courier not found." });

    const zones = await CourierZone.find({ courierId: id }).select("_id").lean();
    const zoneIds = zones.map((z) => z._id);
    if (zoneIds.length > 0) {
      await CourierZone.deleteMany({ courierId: id });
      await CourierRate.deleteMany({ zoneId: { $in: zoneIds } });
    }

    res.json({ message: "Courier deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete courier." });
  }
}

/* ------------------------------- Zone CRUD -------------------------------- */

export async function getZones(req, res) {
  try {
    const { courierId } = req.query;
    const filter = courierId ? { courierId } : {};
    const zones = await CourierZone.find(filter).sort({ createdAt: 1 }).lean();
    res.json(zones);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch zones." });
  }
}

export async function createZone(req, res) {
  try {
    const { courierId, name, states, districts, pincodes } = req.body;
    if (!isObjectId(courierId)) return res.status(400).json({ error: "Valid courier id is required." });
    if (!name || !String(name).trim()) return res.status(400).json({ error: "Zone name is required." });

    const courier = await Courier.findById(courierId);
    if (!courier) return res.status(404).json({ error: "Courier not found." });

    const zone = new CourierZone({
      courierId,
      name: String(name).trim(),
      states: sanitizeStringList(states),
      districts: sanitizeStringList(districts),
      pincodes: sanitizeStringList(pincodes),
    });
    await zone.save();

    if (req.body.rate !== undefined) {
      const validated = validateRateInput(req.body.rate);
      if (validated.error) return res.status(400).json({ error: validated.error });
      await CourierRate.create({ zoneId: zone._id, ...validated.values });
    }

    const saved = await CourierZone.findById(zone._id).lean();
    res.status(201).json({ message: "Zone created successfully.", zone: saved });
  } catch (error) {
    res.status(500).json({ error: "Failed to create zone." });
  }
}

export async function updateZone(req, res) {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) return res.status(400).json({ error: "Invalid zone id." });

    const updates = {};
    if (req.body.name !== undefined) {
      if (!String(req.body.name).trim()) return res.status(400).json({ error: "Zone name cannot be empty." });
      updates.name = String(req.body.name).trim();
    }
    if (req.body.states !== undefined) updates.states = sanitizeStringList(req.body.states);
    if (req.body.districts !== undefined) updates.districts = sanitizeStringList(req.body.districts);
    if (req.body.pincodes !== undefined) updates.pincodes = sanitizeStringList(req.body.pincodes);

    const zone = await CourierZone.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true });
    if (!zone) return res.status(404).json({ error: "Zone not found." });

    if (req.body.rate !== undefined) {
      const validated = validateRateInput(req.body.rate);
      if (validated.error) return res.status(400).json({ error: validated.error });
      await CourierRate.findOneAndUpdate(
        { zoneId: zone._id },
        { $set: validated.values },
        { upsert: true, new: true }
      );
    }

    const saved = await CourierZone.findById(zone._id).lean();
    res.json({ message: "Zone updated successfully.", zone: saved });
  } catch (error) {
    res.status(500).json({ error: "Failed to update zone." });
  }
}

export async function deleteZone(req, res) {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) return res.status(400).json({ error: "Invalid zone id." });

    const zone = await CourierZone.findByIdAndDelete(id);
    if (!zone) return res.status(404).json({ error: "Zone not found." });

    await CourierRate.deleteMany({ zoneId: id });

    res.json({ message: "Zone deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete zone." });
  }
}

/* ------------------------------- Rate CRUD -------------------------------- */

export async function getRates(req, res) {
  try {
    const { zoneId } = req.query;
    const filter = zoneId ? { zoneId } : {};
    const rates = await CourierRate.find(filter).sort({ createdAt: 1 }).lean();
    res.json(rates);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch rates." });
  }
}

export async function setRate(req, res) {
  try {
    const { zoneId, upTo500g, upTo1kg, additionalKg } = req.body;
    if (!isObjectId(zoneId)) return res.status(400).json({ error: "Valid zone id is required." });

    const zone = await CourierZone.findById(zoneId);
    if (!zone) return res.status(404).json({ error: "Zone not found." });

    const validated = validateRateInput({ upTo500g, upTo1kg, additionalKg });
    if (validated.error) return res.status(400).json({ error: validated.error });

    const rate = await CourierRate.findOneAndUpdate(
      { zoneId },
      { $set: validated.values },
      { upsert: true, new: true, runValidators: true }
    );
    res.json({ message: "Rate saved successfully.", rate });
  } catch (error) {
    res.status(500).json({ error: "Failed to save rate." });
  }
}

/* --------------------------- Public shipping APIs ------------------------- */

export async function getPublicShippingRates(req, res) {
  try {
    const { pincode, state, district } = req.query;
    if (!pincode || !/^\d{6}$/.test(String(pincode))) {
      return res.status(400).json({ success: false, message: "Valid 6-digit pincode is required." });
    }

    const results = await getShippingRatesForAddress({
      pincode: String(pincode),
      state: String(state || ""),
      district: String(district || ""),
    });

    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch shipping rates." });
  }
}

export async function calculateShippingRates(req, res) {
  try {
    const { items, pincode, state, district, courierId } = req.body;
    if (!pincode || !/^\d{6}$/.test(String(pincode))) {
      return res.status(400).json({ success: false, message: "Valid 6-digit pincode is required." });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Items are required to calculate shipping." });
    }

    const result = await calculateShipping({
      items,
      pincode: String(pincode),
      state: String(state || ""),
      district: String(district || ""),
      courierId,
    });

    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Failed to calculate shipping." });
  }
}

export async function resolveShipping(req, res) {
  try {
    const { pincode, state, district, weightGrams, courierId } = req.body;
    if (!pincode || !/^\d{6}$/.test(String(pincode))) {
      return res.status(400).json({ success: false, message: "Valid 6-digit pincode is required." });
    }

    const zone = await findZoneForAddress({ pincode: String(pincode), state: String(state || ""), district: String(district || "") });
    if (!zone) {
      return res.status(404).json({ success: false, message: "No shipping zone matches this address." });
    }

    const rate = await getCourierRateForZone(zone._id);
    if (!rate) {
      return res.status(404).json({ success: false, message: "No shipping rate configured for this zone." });
    }

    const charge = computeShippingCharge({ ...rate, weightGrams: Number(weightGrams) || 0 });

    res.json({
      success: true,
      zone: { id: zone._id, name: zone.name, courierId: zone.courierId },
      rate,
      charge,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Failed to resolve shipping." });
  }
}
