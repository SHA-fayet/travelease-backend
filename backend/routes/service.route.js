import express from "express";
import { requireSignIn } from "../middlewares/authMiddleware.js";
import { createService, getServices } from "../controllers/service.controller.js";
import upload from "../middlewares/multer.js";
import User from "../models/user.model.js";

const router = express.Router();

const isAgencyOrAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user?.id || req.user?._id);
    if (user && (user.user_role === 1 || user.user_role === 2)) return next();
    return res.status(403).send({ success: false, message: "Unauthorized Access" });
  } catch (error) {
    return res.status(500).send({ success: false, message: "Server error" });
  }
};

// Routes expect the parameter :type (e.g., /api/services/hotel/create)
router.post("/:type/create", requireSignIn, isAgencyOrAdmin, upload.array("images", 5), createService);
router.get("/:type/list", getServices);

export default router;