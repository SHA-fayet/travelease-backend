import mongoose from "mongoose";
import dotenv from "dotenv";
import Hotel from "./models/hotel.model.js"; // Adjust this path if your model is named differently

dotenv.config();

// The exact 52 classes from your DINOv2 model
const rawClasses = [
    "60_Gombuj_Mosque", "Ahsan_Manzil", "Alutila_Cave", "Armenian_Church", "Bhawal_National_uddan",
    "Bhawal_resort_and_spa", "Bichnakandi", "Birishiri", "Chimbuk_Hill", "Chini_Mosque",
    "Chondronath_Pahar_Shitakundo", "Chuti_resort", "Coxsbazar_Sea_Beach", "Debotakhum",
    "Dhakeshwari_Temple", "Dream_square_resort", "Guliyakhan_Sea_Beach_Shitakundo", "Hanging_Bridge",
    "Hazrat_Shahjalal_Mazar", "Himchori", "Inani_Beach", "Jaflong", "Kaptai_Lake",
    "Khoiyachora_Waterfall", "Kuakata_Sea_Beach", "Lalbagh_Fort", "Lalon_Shah_Akhra",
    "Madhobkundo_Waterfall", "Madhobpur_Lake", "Mithamain_Haor", "Mohamaya_Lake", "Mohasthangor",
    "Nafakhum", "Nikli_Haor", "Nilachol", "Nilgiri", "Paharpur_Boudho_Bihar", "Panam_Nagar",
    "Potenga_Sea_Beach", "Rajbon_Bihar", "Ramna_Park", "Reverie_resort", "Saint_Martin",
    "Sajek_Valley", "Sarah_resort", "Shada_Pathor", "Shalbon_Bihar", "Shohid_Minar",
    "Sreemangal", "Sriti_Shoudho", "Sundarban", "Tanguar_Haor"
];

// Replicate the cleaning logic from your ai.controller.js
const cleanLocationName = (rawName) => {
  let clean = rawName.replace(/_/g, " ");
  if (clean === "Coxsbazar Sea Beach") return "Cox's Bazar";
  if (clean === "Chondronath Pahar Shitakundo") return "Sitakunda";
  return clean;
};

// Generate an array of 52 hotel documents
const seedHotels = rawClasses.map((raw) => {
  const loc = cleanLocationName(raw);
  const randomPrice = Math.floor(Math.random() * (8000 - 2500 + 1)) + 2500; // Between 2500 and 8000 BDT
  
  return {
    name: `Grand ${loc} Resort & Spa`,
    location: loc,
    pricePerNight: randomPrice,
    roomType: "Premium Deluxe Room",
    // Using a high-quality Unsplash placeholder image for all seed hotels
    images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"],
    description: `Experience the best hospitality near ${loc} with premium amenities, complimentary breakfast, and scenic views.`,
    facilities: ["Free WiFi", "Swimming Pool", "Restaurant", "Room Service"],
    rating: (Math.random() * (5.0 - 4.0) + 4.0).toFixed(1) // Random rating between 4.0 and 5.0
  };
});

const runSeeder = async () => {
  try {
    // Connect to your MongoDB instance using your .env variable
    await mongoose.connect(process.env.MONGO || process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    console.log("Connected to MongoDB...");

    // Insert all 52 hotels at once
    const inserted = await Hotel.insertMany(seedHotels);
    
    console.log(`✅ Successfully seeded ${inserted.length} hotels into the database!`);
    console.log("Every AI destination will now display a matching hotel.");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding the database:", error);
    process.exit(1);
  }
};

runSeeder();