import mongoose from "mongoose";

const hotelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true, index: true }, // Essential for AI Image Search matching
    description: { type: String, required: true },
    pricePerNight: { type: Number, required: true },
    roomType: { type: String, default: "Standard" },
    amenities: { type: [String], default: ["WiFi", "AC", "Breakfast"] },
    images: { type: [String], default: ["default-hotel.jpg"] },
    rating: { type: Number, default: 5 },
    totalRatings: { type: Number, default: 0 },
    agencyId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  },
  { timestamps: true }
);

export default mongoose.model("Hotel", hotelSchema);