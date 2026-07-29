import mongoose from "mongoose";

const stockAdjustmentSchema = new mongoose.Schema({
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Batch",
    required: true,
  },
  previousStock: { type: Number, required: true },
  newStock: { type: Number, required: true },
  difference: { type: Number, required: true },
  reason: {
    type: String,
    enum: ["OFFLINE_SALES", "EXPIRED", "DAMAGED", "STOCK_CORRECTION", "SAMPLE", "OTHER"],
    required: true,
  },
  reasonDetails: { type: String, default: "" },
  updatedBy: { type: String, default: "" },
}, { timestamps: true });

const StockAdjustment = mongoose.model("StockAdjustment", stockAdjustmentSchema);
export default StockAdjustment;
