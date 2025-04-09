import mongoose from "mongoose";

const transportationSchema = new mongoose.Schema(
  {
    operatorName: { type: String, required: true }, // e.g., Green Line, NovoAir
    vehicleType: { type: String, required: true }, // Bus, Flight, Train, Boat
    departureLocation: { type: String, required: true, index: true },
    arrivalLocation: { type: String, required: true, index: true },
    departureTime: { type: Date, required: true },
    price: { type: Number, required: true },
    features: { type: [String], default: ["AC"] },
    images: { type: [String], default: ["default-transport.jpg"] },
    agencyId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  },
  { timestamps: true }
);

export default mongoose.model("Transportation", transportationSchema);