import express from "express";
import { analyzeDestinationImage } from "../controllers/ai.controller.js";
import upload from "../middlewares/multer.js"; 

const router = express.Router();

// Route: POST /api/ai/analyze
router.post("/analyze", upload.single("image"), analyzeDestinationImage);

export default router;