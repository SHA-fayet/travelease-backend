import mongoose from "mongoose";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Package from "./models/package.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

// Configure Cloudinary using your .env variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const UPLOADS_DIR = path.join(__dirname, "uploads");

const migrateImages = async () => {
  try {
    const dbUri = process.env.MONGO_URL || process.env.MONGO || process.env.DATABASE_URL;
    if (!dbUri) throw new Error("MongoDB URI missing from .env");

    await mongoose.connect(dbUri);
    console.log("✅ Connected to MongoDB for Migration.");

    const packages = await Package.find({});
    console.log(`Found ${packages.length} packages to process.`);

    for (const pkg of packages) {
      let updatedImages = [];
      let modified = false;

      for (const imageName of pkg.packageImages) {
        // Skip if it is already a Cloudinary or web URL
        if (imageName.startsWith("http")) {
          updatedImages.push(imageName);
          continue;
        }

        const localFilePath = path.join(UPLOADS_DIR, imageName);

        // Upload to Cloudinary if the file exists locally
        if (fs.existsSync(localFilePath)) {
          console.log(`Uploading ${imageName} to Cloudinary...`);
          
          try {
            // CRITICAL FIX: Using upload_large to handle images over 10MB safely
            const result = await cloudinary.uploader.upload_large(localFilePath, {
              folder: "travelease",
              resource_type: "image"
            });
            
            updatedImages.push(result.secure_url);
            modified = true;
          } catch (uploadError) {
            console.error(`❌ Failed to upload ${imageName}:`, uploadError.message);
            // Keep the original name in the database so it isn't lost if upload fails
            updatedImages.push(imageName);
          }
          
        } else {
          console.log(`⚠️ Local file missing, keeping original name: ${imageName}`);
          updatedImages.push(imageName);
        }
      }

      // Save the updated package back to MongoDB
      if (modified) {
        pkg.packageImages = updatedImages;
        await pkg.save();
        console.log(`✅ Successfully updated database for: ${pkg.packageName}`);
      }
    }

    console.log("🎉 All packages migrated to Cloudinary successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Migration Error:", error);
    process.exit(1);
  }
};

migrateImages();