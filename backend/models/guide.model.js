import mongoose from "mongoose";

const guideSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true, index: true },
    expertise: { type: String, required: true }, // e.g., Historical Tours, Trekking
    languages: { type: [String], required: true }, // e.g., English, Bengali
    pricePerDay: { type: Number, required: true },
    contactNumber: { type: String, required: true },
    images: { type: [String], default: ["default-guide.jpg"] },
    rating: { type: Number, default: 5 },
    agencyId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  },
  { timestamps: true }
);

export default mongoose.model("Guide", guideSchema);