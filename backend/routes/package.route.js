import express from "express";
import { requireSignIn } from "../middlewares/authMiddleware.js";
import {
  createPackage,
  deletePackage,
  getPackageData,
  getPackages,
  updatePackage,
} from "../controllers/package.controller.js";
import upload from "../middlewares/multer.js";
import User from "../models/user.model.js";

const router = express.Router();

// Custom Middleware: Allows either System Admin (1) or Partner Agency (2)
const isAgencyOrAdmin = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const user = await User.findById(userId);
    
    if (user && (user.user_role === 1 || user.user_role === 2)) {
      next();
    } else {
      return res.status(403).send({
        success: false,
        message: "Unauthorized Access: Admin or Agency permission required",
      });
    }
  } catch (error) {
    console.error("Authorization Middleware Error:", error);
    return res.status(500).send({ success: false, message: "Server error in authorization" });
  }
};

// CRITICAL FIX: Maps Cloudinary URLs to filename so controllers don't need changes
const mapCloudinaryUrls = (req, res, next) => {
  if (req.files) {
    req.files.forEach((file) => {
      // file.path contains the live Cloudinary URL. We map it to filename
      // so your MongoDB database saves the full link automatically.
      file.filename = file.path; 
    });
  }
  next();
};

// Create package (Admin or Agency)
router.post(
  "/create-package",
  requireSignIn,
  isAgencyOrAdmin,
  upload.array("packageImages", 10),
  mapCloudinaryUrls,
  createPackage
);

// update package by id
router.post(
  "/update-package/:id",
  requireSignIn,
  isAgencyOrAdmin,
  upload.array("packageImages", 10),
  mapCloudinaryUrls,
  updatePackage
);

// Delete package by id (Admin or Agency)
router.delete("/delete-package/:id", requireSignIn, isAgencyOrAdmin, deletePackage);

// Get all packages (Public)
router.get("/get-packages", getPackages);

// Get single package data by id (Public)
router.get("/get-package-data/:id", getPackageData);

export default router;