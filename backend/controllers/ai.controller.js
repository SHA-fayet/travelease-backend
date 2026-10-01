import fs from "fs";
import FormData from "form-data";
import fetch from "node-fetch";
import Package from "../models/package.model.js";
import Hotel from "../models/hotel.model.js";
import Guide from "../models/guide.model.js";

export const analyzeDestinationImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send({ success: false, message: "No image provided" });
    }

    const formData = new FormData();

    // 🟢 CRITICAL FIX: Handle Cloudinary URLs vs Local Files
    if (req.file.path.startsWith("http")) {
      // 1. Fetch the image from Cloudinary into memory
      const imgRes = await fetch(req.file.path);
      if (!imgRes.ok) throw new Error("Could not fetch image from Cloudinary");
      
      // 2. Convert to a Buffer and attach it to the form data
      const arrayBuffer = await imgRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      formData.append("file", buffer, { 
        filename: req.file.originalname || "image.jpg",
        contentType: req.file.mimetype || "image/jpeg" 
      });
    } else {
      // Fallback: If it's a local file, read it normally
      formData.append("file", fs.createReadStream(req.file.path));
    }

    // 🔴 REPLACE THIS WITH YOUR ACTIVE NGROK LINK IF IT CHANGED 🔴
    const NGROK_URL = "https://defense-virtuous-diligence.ngrok-free.dev/predict";

    const aiResponse = await fetch(NGROK_URL, {
      method: "POST",
      body: formData,
      headers: {
        ...formData.getHeaders(),
        "ngrok-skip-browser-warning": "true" // Prevents ngrok from blocking the API call
      }
    });

    if (!aiResponse.ok) {
      throw new Error("Failed to communicate with AI microservice");
    }

    const aiData = await aiResponse.json();
    
    // 1. Extract the raw prediction
    let rawLocation = aiData.predicted_class || aiData.prediction || "Cox's Bazar"; 
    
    // 2. CLEAN THE STRING: Replace underscores with spaces (e.g., "Sajek_Valley" -> "Sajek Valley")
    let cleanLocation = rawLocation.replace(/_/g, " ");

    // 3. (Optional) Handle specific edge cases where the folder name differs from human spelling
    if (cleanLocation === "Coxsbazar Sea Beach") cleanLocation = "Cox's Bazar";
    if (cleanLocation === "Chondronath Pahar Shitakundo") cleanLocation = "Sitakunda";

    // 🟢 CRITICAL FIX: Only try to delete the file if it's local (Do not try to delete Cloudinary URLs)
    if (!req.file.path.startsWith("http") && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    // 4. Search MongoDB using the cleaned string
    const regex = new RegExp(cleanLocation, "i");

    const [packages, hotels, guides] = await Promise.all([
      Package.find({ packageDestination: regex }).limit(4),
      Hotel.find({ location: regex }).limit(4),
      Guide.find({ location: regex }).limit(4)
    ]);

    res.status(200).send({
      success: true,
      location: cleanLocation,
      confidence: aiData.confidence || 0.95,
      data: {
        packages,
        hotels,
        guides
      }
    });

  } catch (error) {
    console.error("AI Analysis Error:", error);
    // Safely attempt cleanup on error
    if (req.file && req.file.path && !req.file.path.startsWith("http") && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).send({ success: false, message: "AI Analysis failed" });
  }
};