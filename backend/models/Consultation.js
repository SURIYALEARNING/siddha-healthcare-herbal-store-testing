import mongoose from "mongoose";

const consultationSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  email: { type: String, default: "" },
  preferredDate: { type: String, required: true },
  preferredTime: { type: String, required: true },
  healthIssues: { type: String, default: "General Siddha Health Consult." },
  status: { type: String, default: "Confirmed" },
}, { timestamps: true });

const Consultation = mongoose.model("Consultation", consultationSchema);
export default Consultation;
