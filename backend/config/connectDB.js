import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Replicate __dirname in ES Modules to locate the current file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly point dotenv to tour/backend/.env
dotenv.config({ path: path.join(__dirname, "..", ".env") });

export const connectDB = async () => {
  try {
    // Prevent undefined crashes by checking if the variable exists first
    if (!process.env.MONGO_URL) {
      console.error("❌ MONGO_URL is missing or empty in your .env file.");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URL);
    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ Error connecting to DB:", error.message || error);
    process.exit(1);
  }
};