import mongoose from "mongoose";
import dotenv from "dotenv";
import bcryptjs from "bcryptjs";
import User from "./models/user.model.js";

dotenv.config();

const seedUsers = async () => {
  try {
    console.log("Connecting to MongoDB...");
    const dbUri = process.env.MONGO_URL || process.env.MONGO || process.env.DATABASE_URL;
    
    if (!dbUri) {
      console.error("❌ ERROR: Could not find MongoDB URI in .env file.");
      process.exit(1);
    }
    await mongoose.connect(dbUri);
    console.log("Connected successfully!");

    // Set a universal password for all dummy accounts so you can easily log in to test them
    const salt = bcryptjs.genSaltSync(10);
    const hashedPassword = bcryptjs.hashSync("password123", salt);

    console.log("Creating dummy Agencies...");
    const agencies = [
      {
        username: "bengal_tours",
        email: "contact@bengaltours.com",
        password: hashedPassword,
        address: "Banani, Dhaka",
        phone: "01711-123456",
        user_role: 2,
        agencyName: "Bengal Tours & Travels",
        businessLicense: "BT-2026-9876",
        isVerifiedAgency: true,
        avatar: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400",
      },
      {
        username: "sylhet_explorers",
        email: "info@sylhetexplorers.bd",
        password: hashedPassword,
        address: "Zindabazar, Sylhet",
        phone: "01811-654321",
        user_role: 2,
        agencyName: "Sylhet Explorers",
        businessLicense: "SE-2026-1234",
        isVerifiedAgency: true,
        avatar: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400",
      },
      {
        username: "oceanic_escapes",
        email: "hello@oceanicescapes.com",
        password: hashedPassword,
        address: "Kolatoli, Cox's Bazar",
        phone: "01911-987654",
        user_role: 2,
        agencyName: "Oceanic Escapes",
        businessLicense: "OE-2026-4567",
        isVerifiedAgency: true,
        avatar: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=400",
      }
    ];

    console.log("Creating dummy Travelers...");
    const travelers = [
      {
        username: "nafis_ahmed",
        email: "nafis@example.com",
        password: hashedPassword,
        address: "Dhanmondi, Dhaka",
        phone: "01511-111111",
        user_role: 0,
        bio: "Avid backpacker and landscape photographer. Always looking for the next mountain to climb.",
        travelInterests: ["Trekking", "Photography", "Camping"],
        lookingForPartner: true,
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400",
      },
      {
        username: "tania_sultana",
        email: "tania@example.com",
        password: hashedPassword,
        address: "Khulna",
        phone: "01611-222222",
        user_role: 0,
        bio: "Foodie and history nerd. I travel to eat local delicacies and explore ancient ruins.",
        travelInterests: ["History", "Food Tours", "Culture"],
        lookingForPartner: false,
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
      },
      {
        username: "rakib_hasan",
        email: "rakib@example.com",
        password: hashedPassword,
        address: "Chittagong",
        phone: "01711-333333",
        user_role: 0,
        bio: "Weekend traveler trying to escape corporate life one beach at a time.",
        travelInterests: ["Beaches", "Relaxation", "Road Trips"],
        lookingForPartner: true,
        avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400",
      },
      {
        username: "farhana_islam",
        email: "farhana@example.com",
        password: hashedPassword,
        address: "Mirpur, Dhaka",
        phone: "01811-444444",
        user_role: 0,
        bio: "Solo female traveler sharing my journey across Bangladesh.",
        travelInterests: ["Solo Travel", "Nature", "Vlogging"],
        lookingForPartner: false,
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
      },
      {
        username: "imran_khan",
        email: "imran@example.com",
        password: hashedPassword,
        address: "Rajshahi",
        phone: "01911-555555",
        user_role: 0,
        bio: "I love arranging group tours and meeting new people on the road.",
        travelInterests: ["Group Tours", "Adventure", "Hiking"],
        lookingForPartner: true,
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
      }
    ];

    await User.insertMany(agencies);
    await User.insertMany(travelers);

    console.log("✅ Database successfully enriched with users and agencies!");
    console.log("🔑 Note: The password for ALL these accounts is 'password123'");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding users:", error);
    process.exit(1);
  }
};

seedUsers();