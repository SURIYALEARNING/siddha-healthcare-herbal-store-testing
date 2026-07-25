import mongoose from "mongoose";

const translationSchema = new mongoose.Schema(
  {
    en: { type: String, default: "" },
    ta: { type: String, default: "" },
  },
  { _id: false }
);

export default translationSchema;
