import mongoose from "mongoose";

const packageSchema = new mongoose.Schema(
  {
    packageName: {
      type: String,
      required: true,
    },
    // Unified destination field (Critical for AI Visual Destination Discovery)
    packageDestination: {
      type: String,
      required: true,
      index: true,
    },
    // Made optional to prevent backend crashes, but kept for advanced AI search filtering
    placeName: {
      type: String,
      default: "",
    },
    district: {
      type: String,
      default: "",
    },
    packageDescription: {
      type: String,
      required: true,
    },
    packageDays: {
      type: Number,
      default: 3,
    },
    packageNights: {
      type: Number,
      default: 2,
    },
    packageAccommodation: {
      type: String,
      default: "Hotel / Eco Resort",
    },
    packageTransportation: {
      type: String,
      default: "AC Bus / Local Transport",
    },
    packageMeals: {
      type: String,
      default: "Breakfast & Dinner Included",
    },
    packageActivities: {
      type: String,
      default: "Sightseeing, Guided Tour, Photography",
    },
    packagePrice: {
      type: Number,
      required: true,
    },
    packageDiscountPrice: {
      type: Number,
      default: 0,
    },
    packageOffer: {
      type: Boolean,
      default: false,
    },
    packageImages: {
      type: [String],
      default: ["default-travel.jpg"],
    },
    packageRating: {
      type: Number,
      default: 5,
    },
    packageTotalRatings: {
      type: Number,
      default: 0,
    },
    
    // --- AGENCY & ADMIN RELATIONSHIPS (Feature 6 Requirement) ---
    agencyName: {
      type: String,
      default: "TravelEase Official",
    },
    agencyId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      index: true 
    },
    userRef: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    },
  },
  { timestamps: true }
);

export default mongoose.model("Package", packageSchema);