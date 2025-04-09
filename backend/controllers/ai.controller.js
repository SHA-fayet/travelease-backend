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
    formData.append("file", fs.createReadStream(req.file.path));

    const aiResponse = await fetch("http://127.0.0.1:7860/predict", {
      method: "POST",
      body: formData,
      headers: formData.getHeaders()
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

    fs.unlinkSync(req.file.path);

    // 4. Search MongoDB using the cleaned string
    const regex = new RegExp(cleanLocation, "i");

    const [packages, hotels, guides] = await Promise.all([
      Package.find({ packageDestination: regex }).limit(4),
      Hotel.find({ location: regex }).limit(4),
      Guide.find({ location: regex }).limit(4)
    ]);

    res.status(200).send({
      success: true,
      location: cleanLocation, // Sends "Sajek Valley" instead of "Sajek_Valley"
      confidence: aiData.confidence || 0.95,
      data: {
        packages,
        hotels,
        guides
      }
    });

  } catch (error) {
    console.error("AI Analysis Error:", error);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).send({ success: false, message: "AI Analysis failed" });
  }
};