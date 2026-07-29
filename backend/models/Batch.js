import mongoose from "mongoose";

const batchSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  batchNumber: {
    type: String,
    required: true,
    unique: true,
  },
  quantityProduced: {
    type: Number,
    required: true,
    min: 0,
  },
  currentStock: {
    type: Number,
    required: true,
    min: 0,
  },
  manufactureDate: {
    type: Date,
    required: true,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  preparedBy: { type: String, default: "" },
  supervisedBy: { type: String, default: "" },
  approvedBy: { type: String, default: "" },
  status: {
    type: String,
    enum: ["ACTIVE", "OUT_OF_STOCK", "HOLD", "EXPIRED"],
    default: "ACTIVE",
  },
}, { timestamps: true });

const Batch = mongoose.model("Batch", batchSchema);
export default Batch;
