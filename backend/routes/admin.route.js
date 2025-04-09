import express from "express";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import { getAllUsers, updateUserRole, getAdminStats } from "../controllers/admin.controller.js";

const router = express.Router();

// All routes require sign-in AND admin privileges
router.get("/users", requireSignIn, isAdmin, getAllUsers);
router.put("/update-role/:userId", requireSignIn, isAdmin, updateUserRole);
router.get("/stats", requireSignIn, isAdmin, getAdminStats);

export default router;