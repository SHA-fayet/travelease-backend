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

// Create package (Admin or Agency)
router.post(
  "/create-package",
  requireSignIn,
  isAgencyOrAdmin,
  upload.array("packageImages", 10),
  createPackage
);

// update package by id
router.post(
  "/update-package/:id",
  requireSignIn,
  isAgencyOrAdmin, // <-- CRITICAL: This must be isAgencyOrAdmin, NOT isAdmin
  upload.array("packageImages", 10),
  updatePackage
);
// Delete package by id (Admin or Agency)
router.delete("/delete-package/:id", requireSignIn, isAgencyOrAdmin, deletePackage);

// Get all packages (Public)
router.get("/get-packages", getPackages);

// Get single package data by id (Public)
router.get("/get-package-data/:id", getPackageData);

export default router;