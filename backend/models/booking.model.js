import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, 
    
    // --- NEW FIELDS FOR STANDALONE SERVICES ---
    itemType: { 
      type: String, 
      enum: ["Package", "Hotel", "Transportation", "Guide"], 
      default: "Package" 
    },
    serviceId: { type: mongoose.Schema.Types.ObjectId, refPath: 'itemType' }, 
    serviceName: { type: String }, // Easy reference for the agency dashboard

    // --- LEGACY PACKAGE FIELDS (Made optional so standalone services don't crash) ---
    packageId: { type: mongoose.Schema.Types.ObjectId, ref: "Package" },
    packageDetails: { type: mongoose.Schema.Types.ObjectId, ref: "Package" },
    
    travelDate: { type: Date, required: true },
    date: { type: Date }, 
    travelersCount: { type: Number, default: 1 },
    persons: { type: Number, default: 1 }, 
    totalPrice: { type: Number, required: true },
    
    status: { type: String, default: "Booked" },
    bookingStatus: { type: String, default: "Confirmed" },
    paymentStatus: { type: String, default: "Paid" },
    cancellationReason: { type: String, default: "" }
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);