import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  orderItemIndex: { type: Number, required: true },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: { type: Number, required: true, min: 1 },
  reminderDays: { type: Number, required: true, min: 0 },
  purchaseDate: { type: Date, required: true },
  reminderDate: { type: Date, required: true },
  whatsappStatus: {
    type: String,
    enum: ["PENDING", "SENT", "FAILED"],
    default: "PENDING",
  },
  callStatus: {
    type: String,
    enum: [
      "PENDING", "PURCHASED_AGAIN", "NOT_INTERESTED",
      "NO_RESPONSE", "WRONG_NUMBER", "CALL_LATER", "OTHER",
    ],
    default: "PENDING",
  },
  callReason: { type: String, default: "" },
  callNotes: { type: String, default: "" },
  status: {
    type: String,
    enum: [
      "PENDING", "WHATSAPP_SENT", "CALL_PENDING",
      "CALL_COMPLETED", "PURCHASED_AGAIN", "CLOSED",
    ],
    default: "PENDING",
  },
}, { timestamps: true });

reminderSchema.index({ customerId: 1, productId: 1, status: 1 });
reminderSchema.index({ reminderDate: 1, status: 1 });

const Reminder = mongoose.model("Reminder", reminderSchema);
export default Reminder;
