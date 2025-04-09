import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import Package from "./models/package.model.js";
import { placeToDistrictMap } from "./utils/districtMapper.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

// ==========================================================
// ⚠️ CHANGE THIS TO THE ACTUAL PATH OF YOUR IMAGE DATASET
// Example: "C:/Users/ANZ/Downloads/Place dataset"
// ==========================================================
const DATASET_DIR = "C:\\Users\\ANZ\\Downloads\\resized_dataset_of_Places\\Place dataset"; 

const UPLOADS_DIR = path.join(__dirname, "uploads");

// Ensure backend uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB for Image Seeding.");

    await Package.deleteMany({});
    console.log("Cleared old records.");

    const newPackages = [];

    for (const [placeName, district] of Object.entries(placeToDistrictMap)) {
      const cleanTitle = placeName.replace(/_/g, " ");
      const classFolderPath = path.join(DATASET_DIR, placeName);
      let packageImages = [];

      // If the folder exists in your dataset, grab up to 3 images
      if (fs.existsSync(classFolderPath)) {
        const files = fs.readdirSync(classFolderPath);
        // Filter out non-image files
        const imageFiles = files.filter(f => f.match(/\.(jpg|jpeg|png|webp|jfif)$/i));

        // Take the first 3 images (or less if the folder has fewer)
        const imagesToCopy = imageFiles.slice(0, 3);
        
        for (const img of imagesToCopy) {
          const originalPath = path.join(classFolderPath, img);
          
          // Generate a unique filename so images don't overwrite each other
          const newFileName = `${placeName}_${Date.now()}_${img.replace(/\s+/g, "_")}`;
          const destinationPath = path.join(UPLOADS_DIR, newFileName);
          
          // Copy image from dataset to backend/uploads
          fs.copyFileSync(originalPath, destinationPath);
          packageImages.push(newFileName);
        }
      }

      // Fallback if a folder is missing or empty
      if (packageImages.length === 0) {
        packageImages.push("default-travel.jpg");
      }

      newPackages.push({
        packageName: `Tour to ${cleanTitle}`,
        placeName: placeName,
        district: district,
        packageDestination: `${cleanTitle}, ${district}`,
        packageDescription: `Experience the breathtaking beauty of ${cleanTitle} located in the ${district} district. Verified destination package with guided itinerary and accommodation.`,
        packageDays: 3,
        packageNights: 2,
        packageAccommodation: "Standard Hotel / Resort",
        packageTransportation: "AC Bus / Local Transport",
        packageMeals: "Breakfast & Dinner Included",
        packageActivities: "Sightseeing, Guided Tour, Photography",
        packagePrice: Math.floor(Math.random() * 4000) + 4000,
        packageDiscountPrice: 500,
        packageOffer: true,
        packageImages: packageImages, // <-- NOW CONTAINS YOUR LOCAL IMAGES
        packageRating: 5,
        agencyName: "BengalVista Tours"
      });
    }

    await Package.insertMany(newPackages);
    console.log(`🎉 Successfully seeded ${newPackages.length} packages with your local dataset images!`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Seeding Error:", error);
    process.exit(1);
  }
};

seedDatabase();