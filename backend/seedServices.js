import mongoose from "mongoose";
import dotenv from "dotenv";
import Hotel from "./models/hotel.model.js";
import Transportation from "./models/transportation.model.js";
import Guide from "./models/guide.model.js";
import User from "./models/user.model.js";

dotenv.config();

const seedData = async () => {
  try {
    console.log("Connecting to MongoDB...");
    // Fallback array to catch whatever your env variable is actually named
    const dbUri = process.env.MONGO_URL || process.env.MONGO || process.env.DATABASE_URL;
    
    if (!dbUri) {
      console.error("❌ ERROR: Could not find MongoDB URI in .env file.");
      process.exit(1);
    }
    await mongoose.connect(dbUri);
    console.log("Connected successfully!");

    // Find a user with agency (2) or admin (1) role to assign ownership of these services
    const agencyUser = await User.findOne({ user_role: { $in: [1, 2] } });
    
    if (!agencyUser) {
      console.error("❌ No Agency or Admin user found in the database. Please create one first.");
      process.exit(1);
    }

    const agencyId = agencyUser._id;
    console.log(`Assigning mock data to Agency User: ${agencyUser.username} (${agencyId})`);

    // --- MOCK HOTELS ---
    const hotels = [
      {
        name: "Long Beach Hotel",
        location: "Cox's Bazar",
        description: "Luxury 5-star hotel near Sugandha Beach with ocean views and indoor pool.",
        pricePerNight: 8500,
        roomType: "Deluxe Ocean View",
        amenities: ["WiFi", "AC", "Pool", "Gym", "Breakfast"],
        images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"],
        agencyId,
      },
      {
        name: "Grand Sultan Tea Resort",
        location: "Sylhet",
        description: "Premium golf resort nestled in the lush green tea gardens of Srimangal.",
        pricePerNight: 12000,
        roomType: "King Suite",
        amenities: ["WiFi", "AC", "Golf Course", "Spa", "Breakfast"],
        images: ["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800"],
        agencyId,
      },
      {
        name: "Sajek Eco Valley Resort",
        location: "Sajek Valley",
        description: "Bamboo cottages with clouds literally floating through your balcony.",
        pricePerNight: 4000,
        roomType: "Eco Cottage",
        amenities: ["Balcony", "Hill View", "Local Food"],
        images: ["https://images.unsplash.com/photo-1587381420270-3e1a5b9e6904?w=800"],
        agencyId,
      },
      {
        name: "Pan Pacific Sonargaon",
        location: "Dhaka",
        description: "Historic 5-star hotel in the heart of the capital city.",
        pricePerNight: 15000,
        roomType: "Executive Suite",
        amenities: ["WiFi", "AC", "Pool", "Buffet", "Gym"],
        images: ["https://images.unsplash.com/photo-1542314831-c6a4d14db54d?w=800"],
        agencyId,
      }
    ];

    // --- MOCK TRANSPORTATION ---
    const transports = [
      {
        operatorName: "Green Line Paribahan",
        vehicleType: "Bus",
        departureLocation: "Dhaka",
        arrivalLocation: "Cox's Bazar",
        departureTime: new Date(Date.now() + 86400000 * 2), // 2 days from now
        price: 2000,
        features: ["AC", "Double Decker", "Recliner Seats"],
        images: ["https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800"],
        agencyId,
      },
      {
        operatorName: "NovoAir",
        vehicleType: "Flight",
        departureLocation: "Dhaka",
        arrivalLocation: "Sylhet",
        departureTime: new Date(Date.now() + 86400000 * 5), 
        price: 4500,
        features: ["Snacks", "AC", "Fast Travel"],
        images: ["https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800"],
        agencyId,
      },
      {
        operatorName: "Sonar Tori Express",
        vehicleType: "Train",
        departureLocation: "Dhaka",
        arrivalLocation: "Chittagong",
        departureTime: new Date(Date.now() + 86400000 * 3), 
        price: 850,
        features: ["AC Cabin", "Dining Car"],
        images: ["https://images.unsplash.com/photo-1474487548417-781cbc7149d4?w=800"],
        agencyId,
      }
    ];

    // --- MOCK GUIDES ---
    const guides = [
      {
        name: "Kamrul Hasan",
        location: "Sundarbans",
        expertise: "Wildlife & Mangrove Safari",
        languages: ["Bengali", "English"],
        pricePerDay: 1500,
        contactNumber: "01711-000000",
        images: ["https://images.unsplash.com/photo-1552058544-f2b08422138a?w=800"],
        agencyId,
      },
      {
        name: "Rafiq Ahmed",
        location: "Bandarban",
        expertise: "Trekking & Indigenous Culture",
        languages: ["Bengali", "Chakma", "English"],
        pricePerDay: 2000,
        contactNumber: "01811-000000",
        images: ["https://images.unsplash.com/photo-1533227260828-53e36fe7c062?w=800"],
        agencyId,
      },
      {
        name: "Sadia Rahman",
        location: "Dhaka",
        expertise: "Historical Heritage Tours",
        languages: ["Bengali", "English", "Hindi"],
        pricePerDay: 1000,
        contactNumber: "01911-000000",
        images: ["https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800"],
        agencyId,
      }
    ];

    console.log("Inserting Hotels...");
    await Hotel.insertMany(hotels);
    
    console.log("Inserting Transportation...");
    await Transportation.insertMany(transports);
    
    console.log("Inserting Guides...");
    await Guide.insertMany(guides);

    console.log("✅ Database successfully enriched with mock data!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

seedData();