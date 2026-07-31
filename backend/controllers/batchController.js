import Batch from "../models/Batch.js";
import StockAdjustment from "../models/StockAdjustment.js";

export async function getBatches(req, res) {
  try {
    const batches = await Batch.find()
      .populate("productId", "name images media")
      .sort({ createdAt: -1 });
    res.json(batches);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch batches." });
  }
}

export async function getBatchById(req, res) {
  try {
    const batch = await Batch.findById(req.params.id)
      .populate("productId", "name images media price discountPrice");
    if (!batch) return res.status(404).json({ error: "Batch not found." });
    res.json(batch);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch batch." });
  }
}

export async function createBatch(req, res) {
  try {
    const {
      productId, batchNumber, quantityProduced,
      manufactureDate, expiryDate,
      preparedBy, supervisedBy, approvedBy, status,
    } = req.body;

    if (!productId || !batchNumber || quantityProduced === undefined || !manufactureDate || !expiryDate) {
      return res.status(400).json({ error: "productId, batchNumber, quantityProduced, manufactureDate, and expiryDate are required." });
    }

    if (new Date(expiryDate) <= new Date(manufactureDate)) {
      return res.status(400).json({ error: "Expiry date must be after manufacture date." });
    }

    if (Number(quantityProduced) < 0) {
      return res.status(400).json({ error: "Quantity produced cannot be negative." });
    }

    const existing = await Batch.findOne({ batchNumber });
    if (existing) {
      return res.status(400).json({ error: "Batch number already exists." });
    }

    const batch = await Batch.create({
      productId,
      batchNumber,
      quantityProduced: Number(quantityProduced),
      currentStock: Number(quantityProduced),
      manufactureDate: new Date(manufactureDate),
      expiryDate: new Date(expiryDate),
      preparedBy: preparedBy || "",
      supervisedBy: supervisedBy || "",
      approvedBy: approvedBy || "",
      status: status || "ACTIVE",
    });

    res.status(201).json(batch);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: "Batch number already exists." });
    }
    res.status(500).json({ error: "Failed to create batch." });
  }
}

export async function updateBatch(req, res) {
  try {
    const {
      productId, batchNumber, quantityProduced, currentStock,
      manufactureDate, expiryDate,
      preparedBy, supervisedBy, approvedBy, status,
    } = req.body;

    if (expiryDate && manufactureDate && new Date(expiryDate) <= new Date(manufactureDate)) {
      return res.status(400).json({ error: "Expiry date must be after manufacture date." });
    }

    if (quantityProduced !== undefined && Number(quantityProduced) < 0) {
      return res.status(400).json({ error: "Quantity produced cannot be negative." });
    }

    if (currentStock !== undefined && Number(currentStock) < 0) {
      return res.status(400).json({ error: "Current stock cannot be negative." });
    }

    const updateData = {};
    if (productId) updateData.productId = productId;
    if (batchNumber) updateData.batchNumber = batchNumber;
    if (quantityProduced !== undefined) updateData.quantityProduced = Number(quantityProduced);
    if (currentStock !== undefined) updateData.currentStock = Number(currentStock);
    if (manufactureDate) updateData.manufactureDate = new Date(manufactureDate);
    if (expiryDate) updateData.expiryDate = new Date(expiryDate);
    if (preparedBy !== undefined) updateData.preparedBy = preparedBy;
    if (supervisedBy !== undefined) updateData.supervisedBy = supervisedBy;
    if (approvedBy !== undefined) updateData.approvedBy = approvedBy;
    if (status) updateData.status = status;

    if (batchNumber) {
      const dup = await Batch.findOne({ batchNumber, _id: { $ne: req.params.id } });
      if (dup) return res.status(400).json({ error: "Batch number already exists." });
    }

    const batch = await Batch.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true });
    if (!batch) return res.status(404).json({ error: "Batch not found." });
    res.json(batch);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: "Batch number already exists." });
    }
    res.status(500).json({ error: "Failed to update batch." });
  }
}

export async function adjustStock(req, res) {
  try {
    const { newStock, reason, reasonDetails, updatedBy } = req.body;

    if (newStock === undefined || !reason) {
      return res.status(400).json({ error: "newStock and reason are required." });
    }

    const batch = await Batch.findById(req.params.id);
    if (!batch) return res.status(404).json({ error: "Batch not found." });

    const previousStock = batch.currentStock;
    const newStockNum = Number(newStock);

    if (newStockNum < 0) {
      return res.status(400).json({ error: "Stock cannot be negative." });
    }

    const difference = newStockNum - previousStock;

    await StockAdjustment.create({
      batchId: batch._id,
      previousStock,
      newStock: newStockNum,
      difference,
      reason,
      reasonDetails: reasonDetails || "",
      updatedBy: updatedBy || "",
    });

    batch.currentStock = newStockNum;
    if (newStockNum === 0) {
      batch.status = "OUT_OF_STOCK";
    } else if (batch.status === "OUT_OF_STOCK" && newStockNum > 0) {
      batch.status = "ACTIVE";
    }
    await batch.save();

    res.json({ message: "Stock adjusted successfully.", batch });
  } catch (error) {
    res.status(500).json({ error: "Failed to adjust stock." });
  }
}

export async function getStockHistory(req, res) {
  try {
    const adjustments = await StockAdjustment.find({ batchId: req.params.id })
      .sort({ createdAt: -1 });
    res.json(adjustments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stock history." });
  }
}

export async function allocateFromBatches(productId, quantityRequired, session = null) {
  const query = Batch.find({
    productId,
    status: "ACTIVE",
    currentStock: { $gt: 0 },
  }).sort({ createdAt: 1 });
  if (session) query.session(session);

  const batches = await query;

  let remaining = quantityRequired;
  const allocations = [];

  for (const batch of batches) {
    if (remaining <= 0) break;

    const take = Math.min(remaining, batch.currentStock);
    batch.currentStock -= take;
    if (batch.currentStock === 0) {
      batch.status = "OUT_OF_STOCK";
    }
    if (session) {
      await batch.save({ session });
    } else {
      await batch.save();
    }

    allocations.push({
      batchId: batch._id,
      batchNumber: batch.batchNumber,
      quantity: take,
    });

    remaining -= take;
  }

  if (remaining > 0) {
    throw new Error(`Not enough stock in ACTIVE batches. Short by ${remaining} units.`);
  }

  return allocations;
}
